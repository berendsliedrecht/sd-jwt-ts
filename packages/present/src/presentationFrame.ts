import { getByPath, hasByPath } from '@sd-jwt/utils'
import { DisclosureWithDigest } from '@sd-jwt/types'
import {
    getDisclosureMap,
    getPayloadDisclosureMapping
} from './disclosureMapping'
import { traverseNodes } from './traverse'
import { PresentationFrame } from './types'

export function getDisclosuresForPresentationFrame<
    Payload extends Record<string, unknown> = Record<string, unknown>
>(
    signedPayload: Payload,
    presentationFrame: PresentationFrame<Payload>,
    prettyClaims: Payload,
    disclosures: Array<DisclosureWithDigest> = []
): Array<DisclosureWithDigest> {
    const requiredDisclosureDigests = new Set<string>()
    const disclosureMap = getDisclosureMap(disclosures)
    const payloadDisclosureMapping = getPayloadDisclosureMapping(
        signedPayload,
        disclosureMap
    )

    // No disclosures needed
    if (payloadDisclosureMapping === null) {
        if (disclosures.length > 0) {
            throw new Error(
                'Payload disclosure mapping is null, but disclosures are present.'
            )
        }

        return []
    }

    for (const node of traverseNodes(presentationFrame)) {
        // We only want to process leaf nodes here
        if (!node.isLeaf) continue

        if (typeof node.value !== 'boolean') {
            throw new Error(
                `Expected leaf value in presentation frame to be of type boolean, but found ${typeof node.value}`
            )
        }

        // If the value is false, it means we don't want to disclose it
        if (node.value === false) continue

        if (!hasByPath(prettyClaims, node.path)) {
            throw new Error(
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

        disclosure.parentDisclosures.forEach((d) =>
            requiredDisclosureDigests.add(d.digest)
        )
    }

    return Array.from(requiredDisclosureDigests).map(
        (digest) => disclosureMap[digest].disclosure
    )
}
