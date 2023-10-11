import { deleteByPath } from '../util'
import { SaltGenerator, createDecoys } from './decoys'
import { Disclosure } from './disclosures'
import { SdJwtError } from './error'
import { Hasher, hashDisclosure } from './hashDisclosure'

export type DisclosureFrame<T> = T extends Array<unknown>
    ? {
          [K in keyof T]?: T[K] extends Record<string | number, unknown>
              ? DisclosureFrame<T[K]> | boolean
              : boolean
      }
    : T extends Record<string, unknown>
    ? {
          [K in keyof T]?: T[K] extends Array<unknown>
              ? DisclosureFrame<T[K]> | boolean
              : T[K] extends Record<string, unknown>
              ? ({ __decoyCount?: number } & DisclosureFrame<T[K]>) | boolean
              : boolean
      } & { __decoyCount?: number } & Record<string, unknown>
    : boolean

export const applyDisclosureFrame = async <
    Payload extends Record<string, unknown> = Record<string, unknown>
>(
    saltGenerator: SaltGenerator,
    hasher: Hasher,
    payload: Payload,
    frame: DisclosureFrame<Payload>,
    keys: Array<string> = [],
    cleanup: Array<Array<string>> = [],
    disclosures: Array<Disclosure> = []
): Promise<{
    payload: Record<string, unknown>
    disclosures: Array<Disclosure>
}> => {
    for (const [key, frameValue] of Object.entries(frame)) {
        const newKeys = [...keys, key]

        if (key === '__decoyCount' && typeof frameValue === 'number') {
            const sd: Array<string> = Array.from(
                (payload._sd as string[]) ?? []
            )

            const decoys = await createDecoys(frameValue, saltGenerator, hasher)
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
                const disclosure = new Disclosure(salt, payload[key], key)
                disclosures.push(disclosure)

                const digest = await hashDisclosure(disclosure, hasher)
                const sd: Array<string> = Array.from(
                    (payload._sd as string[]) ?? []
                )
                sd.push(digest)

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
                hasher,
                payload[key] as Payload,
                frameValue as DisclosureFrame<Payload>,
                newKeys,
                cleanup,
                disclosures
            )
        } else {
            throw new SdJwtError(
                `Invalid type in frame with key '${key}' and type '${typeof frameValue}'. Only Record<string, unknown> and boolean are allowed.`
            )
        }
    }

    const payloadClone = { ...payload }
    cleanup.forEach((path) => deleteByPath(payloadClone, path.join('.')))

    return { payload: payloadClone, disclosures }
}
