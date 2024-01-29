import { DisclosureFrame } from '../types'
import { deleteByPath } from '@sd-jwt/utils'
import { createDecoys } from './decoys'
import { Disclosure, DisclosureWithDigest } from './disclosures'
import { SdJwtError } from './error'
import { SaltGenerator } from '../types'
import type { HasherAndAlgorithm } from '@sd-jwt/types'

export const applyDisclosureFrame = async <
    Payload extends Record<string, unknown> = Record<string, unknown>
>(
    saltGenerator: SaltGenerator,
    hasherAndAlgorithm: HasherAndAlgorithm,
    payload: Payload,
    frame: DisclosureFrame<Payload>,
    keys: Array<string> = [],
    cleanup: Array<Array<string>> = [],
    disclosures: Array<DisclosureWithDigest> = []
): Promise<{
    payload: Record<string, unknown>
    disclosures: Array<DisclosureWithDigest>
}> => {
    for (const [key, frameValue] of Object.entries(frame)) {
        const newKeys = [...keys, key]

        if (key === '__decoyCount' && typeof frameValue === 'number') {
            const sd: Array<string> = Array.from(
                (payload._sd as string[]) ?? []
            )

            const decoys = await createDecoys(
                frameValue,
                saltGenerator,
                hasherAndAlgorithm
            )
            decoys.forEach((digest) => sd.push(digest))

            // @ts-ignore
            payload._sd = sd.sort()
        } else if (typeof frameValue === 'boolean') {
            if (frameValue === true) {
                if (!(key in payload)) {
                    throw new SdJwtError(
                        `key, ${key}, is not inside the payload (${JSON.stringify(
                            payload
                        )}), but it was supplied inside the frame.`
                    )
                }

                const salt = await saltGenerator()
                const disclosure = await new Disclosure(
                    salt,
                    payload[key],
                    key
                ).withCalculateDigest(hasherAndAlgorithm)
                disclosures.push(disclosure)

                const sd: Array<string> = Array.from(
                    (payload._sd as string[]) ?? []
                )
                sd.push(disclosure.digest)

                //@ts-ignore
                payload._sd = sd.sort()

                cleanup.push(newKeys)
            }
        } else if (
            typeof frameValue === 'object' &&
            !Array.isArray(frameValue)
        ) {
            await applyDisclosureFrame(
                saltGenerator,
                hasherAndAlgorithm,
                payload[key] as Payload,
                frameValue as DisclosureFrame<Payload>,
                newKeys,
                cleanup,
                disclosures
            )
        } else if (
            typeof frameValue === 'object' &&
            Array.isArray(frameValue)
        ) {
            const payloadArray = payload[key] as Array<unknown>
            const frameValueArray = frameValue as Array<boolean>

            if (!Array.isArray(payloadArray)) {
                throw new SdJwtError(
                    `Frame expected array, but received ${typeof payload[
                        key
                    ]} for key '${key}'.`
                )
            }

            if (frameValueArray.length > payloadArray.length) {
                throw new SdJwtError(
                    `Frame array is longer than the payload array for ${key}`
                )
            }

            // Fill the frame with `false` if the payloadArray is longer than the frame value array
            if (payloadArray.length > frameValueArray.length) {
                payloadArray.forEach(
                    (_, index) => (frameValueArray[index] ??= false)
                )
            }

            const newPayloadArray: Array<{ '...': string } | unknown> = []

            for (let i = 0; i < payloadArray.length; i++) {
                const payloadValue = payloadArray[i]
                const frameValue = frameValueArray[i]

                if (frameValue) {
                    const salt = await saltGenerator()
                    const disclosure = await new Disclosure(
                        salt,
                        payloadValue
                    ).withCalculateDigest(hasherAndAlgorithm)
                    disclosures.push(disclosure)

                    newPayloadArray.push({ '...': disclosure.digest })
                } else {
                    newPayloadArray.push(payloadValue)
                }
            }

            // @ts-ignore
            payload[key] = newPayloadArray
        } else {
            throw new SdJwtError(
                `Invalid type in frame with key '${key}' and type '${typeof frameValue}'. Only Record<string, unknown>, arrays<boolean> and boolean are allowed.`
            )
        }
    }

    const payloadClone = { ...payload }
    cleanup.forEach((path) => deleteByPath(payloadClone, path))

    return { payload: payloadClone, disclosures }
}
