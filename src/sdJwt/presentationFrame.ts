import { getByPath, hasByPath, traverseNodes } from '../utils'
import { Disclosure } from './disclosures'
import { SdJwtError } from './error'
import { Hasher } from '../types'
import { PresentationFrame } from '../types/present'
import {
    getDisclosureMap,
    getPayloadDisclosureMapping
} from './disclosureMapping'

export const getDisclosuresForPresentationFrame = async <
    Payload extends Record<string, unknown> = Record<string, unknown>
>(
    signedPayload: Payload,
    presentationFrame: PresentationFrame<Payload>,
    prettyClaims: Payload,
    hasher: Hasher,
    disclosures: Array<Disclosure> = []
): Promise<Array<Disclosure>> => {
    const requiredDisclosureDigests = new Set<string>()
    const disclosureMap = await getDisclosureMap(disclosures, hasher)
    const payloadDisclosureMapping = getPayloadDisclosureMapping(
        signedPayload,
        disclosureMap
    )

    for (const node of traverseNodes(presentationFrame)) {
        // We only want to process leaf nodes here
        if (!node.isLeaf) continue

        if (typeof node.value !== 'boolean') {
            throw new SdJwtError(
                `Expected leaf value in presentation frame to be of type boolean, but found ${typeof node.value}`
            )
        }

        // If the value is false, it means we don't want to disclose it
        if (node.value === false) continue

        // FIXME: we should check whether the presentation frame matches the type of the payload. So if the presentation frame has an array as value, but the pretty payload
        // has a number it should throw an error
        if (!hasByPath(prettyClaims, node.path)) {
            throw new SdJwtError(
                `Path ${node.path.join(
                    '.'
                )} from presentation frame is not present in pretty SD-JWT payload. The presentation frame may only include properties that are present in the SD-JWT payload.`
            )
        }

        let path = [...node.path]
        while (!hasByPath(payloadDisclosureMapping, path)) {
            if (path.pop() === undefined) break
        }

        // There are no disclosures on this path, meaning the property is disclosed by default in the signed payload
        if (path.length === 0) continue

        const disclosure = getByPath(payloadDisclosureMapping, path)
        // If disclosure is string, it means it's already the digest
        if (typeof disclosure === 'string')
            requiredDisclosureDigests.add(disclosure)
        // Otherwise we want to get all the child digests as well
        else {
            for (const nestedItem of traverseNodes(disclosure)) {
                if (
                    !nestedItem.isLeaf ||
                    typeof nestedItem.value !== 'string'
                ) {
                    continue
                }
                requiredDisclosureDigests.add(nestedItem.value)
            }
        }
    }

    for (const disclosureDigest of requiredDisclosureDigests.values()) {
        const disclosure = disclosureMap[disclosureDigest]

        if (!disclosure) {
            throw new Error('disclosure not found')
        }

        await Promise.all(
            disclosure.parentDisclosures.map(async (d) =>
                requiredDisclosureDigests.add(await d.digest(hasher))
            )
        )
    }

    return Array.from(requiredDisclosureDigests).map(
        (digest) => disclosureMap[digest].disclosure
    )
}
