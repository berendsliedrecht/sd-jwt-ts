// This file contains helpers functions for mapping between disclosures entries and the payload of an SD-JWT.

import { Hasher } from '../types'
import { isObject, traverseNodes } from '../utils'
import { Disclosure } from './disclosures'
import { SdJwtError } from './error'

/**
 * Mapping from a digest to the corresponding disclosure and its parent disclosures.
 */
export type DisclosureMap = {
    [digest: string]: {
        disclosure: Disclosure
        parentDisclosures: Disclosure[]
    }
}

const getArrayPayloadDisclosureMapping = (
    array: Array<unknown>,
    map: DisclosureMap
) => {
    const arrayPayloadDisclosureMapping: any[] = []

    for (const item of array) {
        if (item instanceof Object) {
            // if Array item is { '...': <SD_HASH_DIGEST> }
            if ('...' in item) {
                const digest = item['...']
                if (typeof digest !== 'string') {
                    throw new SdJwtError(
                        `Expected value of key '...' to be of type string, but found ${typeof digest}`
                    )
                }
                const disclosed = map[digest]

                if (disclosed) {
                    const value = [...disclosed.disclosure.decoded].pop()

                    if (isObject(value)) {
                        const unpacked = getPayloadDisclosureMapping(value, map)

                        if (Object.keys(unpacked).length > 0) {
                            arrayPayloadDisclosureMapping.push({
                                ...unpacked,
                                __digest: digest
                            })
                        } else {
                            arrayPayloadDisclosureMapping.push(digest)
                        }
                    } else if (Array.isArray(value)) {
                        const nestedUnpackedArray =
                            getArrayPayloadDisclosureMapping(value, map)

                        if (
                            nestedUnpackedArray.every((item) => item === null)
                        ) {
                            arrayPayloadDisclosureMapping.push(digest)
                        } else {
                            arrayPayloadDisclosureMapping.push(
                                nestedUnpackedArray
                            )
                        }
                    } else {
                        arrayPayloadDisclosureMapping.push(digest)
                    }
                }
            } else {
                // unpack recursively
                const claims = getPayloadDisclosureMapping(item, map)
                if (Object.keys(claims).length > 0) {
                    arrayPayloadDisclosureMapping.push(claims)
                } else {
                    arrayPayloadDisclosureMapping.push(null)
                }
            }
        } else {
            arrayPayloadDisclosureMapping.push(null)
        }
    }

    return arrayPayloadDisclosureMapping
}

/**
 * Get a mapping in the structure of the pretty payload, to indicate which digests should be disclosed for a
 * given entry.
 *
 * @example
 * {
 *    "name": "<digest-name>"
 * }
 *
 * In the above example you now know that to reveal "name", you must include "<digest-name>"
 */
export function getPayloadDisclosureMapping(payload: any, map: DisclosureMap) {
    if (payload instanceof Array) {
        return getArrayPayloadDisclosureMapping(payload, map)
    }

    if (!isObject(payload)) {
        return {}
    }

    const payloadDisclosureMapping: Record<string, unknown> = {}
    for (const key in payload) {
        // if obj property value is an object or array
        // recursively unpack
        if (key !== '_sd' && key !== '...' && payload[key] instanceof Object) {
            const claim = getPayloadDisclosureMapping(payload[key], map)
            if (Object.keys(claim).length > 0) {
                payloadDisclosureMapping[key] = claim
            }
        }
    }

    if (payload._sd) {
        if (!Array.isArray(payload._sd)) {
            throw new SdJwtError(
                `Expect value of '_sd' to be of type array, but found ${typeof payload._sd}`
            )
        }

        for (const digest of payload._sd) {
            if (typeof digest !== 'string') {
                throw new SdJwtError(
                    `Expected entries in '_sd' property to be of type string, found ${typeof digest}`
                )
            }

            const disclosed = map[digest]

            if (disclosed) {
                const value = [...disclosed.disclosure.decoded].pop()
                if (disclosed.disclosure.decoded.length !== 3) {
                    throw new SdJwtError(
                        `Expected disclosure for value ${value} to have 3 items, but found ${disclosed.disclosure.decoded.length}`
                    )
                }
                const key = disclosed.disclosure.decoded[1]

                // This should check if there's a nested disclosure anywhere down the tree
                if (isObject(value)) {
                    const unpacked = getPayloadDisclosureMapping(value, map)
                    if (Object.keys(unpacked).length > 0) {
                        payloadDisclosureMapping[key] = {
                            ...unpacked,
                            __digest: digest
                        }
                    } else {
                        payloadDisclosureMapping[key] = digest
                    }
                } else if (Array.isArray(value)) {
                    payloadDisclosureMapping[key] = getPayloadDisclosureMapping(
                        value,
                        map
                    )
                } else {
                    payloadDisclosureMapping[key] = digest
                }
            }
        }
    }

    return payloadDisclosureMapping
}

// @todo it would ben nice if we don't have to pass hasher around everywhere
// but have a Disclosure type that includes the digest
const getParentDisclosure = async (
    disclosure: Disclosure,
    digestMap: Record<string, Disclosure>,
    hasher: Hasher
): Promise<Disclosure[]> => {
    const parent = digestMap[await disclosure.digest(hasher)]

    if (!parent) {
        return []
    }

    if (digestMap[await parent.digest(hasher)]) {
        return [parent].concat(
            await getParentDisclosure(parent, digestMap, hasher)
        )
    }

    return [parent]
}

/**
 * Get a mapping from a digest to the corresponding disclosure and its parent disclosures.
 */
export const getDisclosureMap = async (
    disclosures: Disclosure[],
    hasher: Hasher
): Promise<DisclosureMap> => {
    const map: DisclosureMap = {}
    const parentMap: Record<string, Disclosure> = {}

    for (const disclosure of disclosures) {
        // value is always the last item in the disclosure array
        const value = [...disclosure.decoded].pop()

        traverseNodes(value).forEach(({ path, value }) => {
            const lastPathItem = path[path.length - 1]

            if (lastPathItem === '_sd') {
                if (!Array.isArray(value)) {
                    throw new SdJwtError(
                        `Expect value of '_sd' to be of type array, but found ${typeof value}`
                    )
                }

                value.forEach((digest) => {
                    if (typeof digest !== 'string') {
                        throw new SdJwtError(
                            `Expected entries in '_sd' property to be of type string, found ${typeof digest}`
                        )
                    }
                    parentMap[digest] = disclosure
                })
            } else if (lastPathItem === '...') {
                if (typeof value !== 'string') {
                    throw new SdJwtError(
                        `Expected value of '...' to be of type string, but found ${typeof value}`
                    )
                }
                parentMap[value] = disclosure
            }
        })
    }

    for (const disclosure of disclosures) {
        const parent = await getParentDisclosure(disclosure, parentMap, hasher)

        map[await disclosure.digest(hasher)] = {
            disclosure,
            parentDisclosures: parent
        }
    }

    return map
}
