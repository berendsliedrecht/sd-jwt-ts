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

/**
 * Returns an array that includes the digests that should be disclosed for each item in the array.
 *
 * E.g. if the following array is passed:
 * ```ts
 * [ { '...': <SD_HASH_DIGEST_1> }, 'string_value', { '...': <SD_HASH_DIGEST_2> } ]
 * ```
 *
 * The return value will be:
 * ```ts
 * ['<SD_HASH_DIGEST_1>', null, '<SD_HASH_DIGEST_2>']
 * ```
 *
 * The second value will be null, as it's already disclosed, and thus there's no digests that
 * need to be disclosed to reveal it. For the other values, it will include the digest that needs
 * to be disclosed to reveal that array entry.
 *
 * In the case the array entry contains nested disclosures, the value will not be a digest, but rather
 * the structure of the nested disclosures.
 *
 * Let's say the `<SD_HASH_DIGEST_1>` is the digest of the following disclosure:
 * ```ts
 * {
 *   // `<SD_HASH_DIGEST_3>` is the digest of the dateOfBirth property
 *   _sd: ['<SD_HASH_DIGEST_3>'],
 *   name: 'Jane Doe',
 * }
 * ```
 *
 * In this case the return value will be:
 * ```ts
 * [{ __digest: '<SD_HASH_DIGEST_1>', dateOfBirth: '<SD_HASH_DIGEST_3>' }, null, '<SD_HASH_DIGEST_2>']
 * ```
 * The `__digest` property indicates the digest of the encapsulating disclosure, and it being an object
 * indicates that there's nested disclosures that need to be revealed.
 *
 * In the end the result value is an array, and all the string values in the return value are the digests.
 * This allows you to easily build a path of digests to disclose to reveal a certain value.
 *
 * The return value can be endlessly nested, and will also call `getPayloadDisclosureMapping` recursively
 * if the inner values are not arrays, but objects. That method in turn can call this method if the value
 * of an object property is an array.
 */
function getArrayPayloadDisclosureMapping(
    array: Array<unknown>,
    map: DisclosureMap
) {
    const arrayPayloadDisclosureMapping: any[] = []

    // Loop through all the payload values of the array
    for (const item of array) {
        // If the item is an object, (both array and object are objects)
        // it means there may be some values in here that need to be disclosed to
        // reveal this array entry
        if (item instanceof Object) {
            // if Array item is { '...': <SD_HASH_DIGEST> }
            // It means this item can be disclosed.
            if ('...' in item) {
                const digest = item['...']
                if (typeof digest !== 'string') {
                    throw new SdJwtError(
                        `Expected value of key '...' to be of type string, but found ${typeof digest}`
                    )
                }

                // Look up disclosure
                const disclosed = map[digest]
                if (!disclosed) {
                    throw new SdJwtError(
                        `Could not find disclosure for digest ${digest}`
                    )
                }

                // value is always the last item in the disclosure array
                const value = [...disclosed.disclosure.decoded].pop()

                // Recursively look if the disclosed value contains any disclosure references
                // of itself. Based on the type we can decide how to handle it.
                if (isObject(value)) {
                    // Get nested disclosures for the object value
                    const unpacked = getPayloadDisclosureMapping(value, map)

                    // If there's any nested disclosures, we need to include both this item's
                    // disclosure, as well as the nested disclosures
                    if (unpacked && Object.keys(unpacked).length > 0) {
                        arrayPayloadDisclosureMapping.push({
                            ...unpacked,
                            __digest: digest
                        })
                    } else {
                        arrayPayloadDisclosureMapping.push(digest)
                    }
                } else if (Array.isArray(value)) {
                    // Get nested disclosures for the array value
                    const nestedUnpackedArray =
                        getArrayPayloadDisclosureMapping(value, map)

                    // If all entries are null, it means there's no nested disclosures
                    // And thus we push the digest directly
                    if (nestedUnpackedArray.every((item) => item === null)) {
                        arrayPayloadDisclosureMapping.push(digest)
                    } else {
                        arrayPayloadDisclosureMapping.push({
                            // This will assign the indexes of the array as keys (so '0': 'value')
                            // And will allow us to still keep the query path (so 'nested.0': 'value')
                            // while also being able to include the `__digest` property to define the
                            // encapsulating disclosure digest
                            ...nestedUnpackedArray,
                            // __digest is for encapsulating disclosure
                            __digest: digest
                        })
                    }
                }
                // If the value is not an object or a array, it means there's no nested disclosures
                // and thus we can push the digest directly
                else {
                    arrayPayloadDisclosureMapping.push(digest)
                }
            } else {
                // Value is not a disclosure for an array ('...') so we unpack the object recursively
                const claims = getPayloadDisclosureMapping(item, map)
                if (claims && Object.keys(claims).length > 0) {
                    arrayPayloadDisclosureMapping.push(claims)
                } else {
                    arrayPayloadDisclosureMapping.push(null)
                }
            }
        }
        // If the value is not an Object it means the actual value is disclosed
        // in the array directly (so we don't need to disclose anything to reveal it)
        else {
            arrayPayloadDisclosureMapping.push(null)
        }
    }

    return arrayPayloadDisclosureMapping
}

/**
 * Get a mapping in the structure of the pretty payload, to indicate which digests should be disclosed for a
 * given entry.
 *
 * For example if you call this method with the following payload:
 * ```ts
 * {
 *  _sd: ['iss_digest', 'nested_field_digest'],
 * }
 * ```
 *
 * It can return the following mapping:
 * ```ts
 * {
 *  iss: 'iss_digest',
 *  nested_field: {
 *    __digest: 'nested_field_digest',
 *    more_nested_field: {
 *      // index 1 is null, as it's always in the payload, so doesn't need to be disclosed
 *      // separately
 *      a: ['a_0_digest', null, 'a_2_digest'],
 *    }
 *  }
 * }
 * ```
 *
 * This method will recursively call itself and `getArrayPayloadDisclosureMapping` if the value of a property is an object or array.
 */
export function getPayloadDisclosureMapping(payload: any, map: DisclosureMap) {
    // Handle array
    if (payload instanceof Array) {
        return getArrayPayloadDisclosureMapping(payload, map)
    }

    // Not an array or object, so it means the top-level value is already disclosed
    if (!isObject(payload)) {
        return null
    }

    const payloadDisclosureMapping: Record<string, unknown> = {}
    for (const key in payload) {
        // if obj property value is an object or array
        // recursively unpack
        if (key !== '_sd' && key !== '...' && payload[key] instanceof Object) {
            const claim = getPayloadDisclosureMapping(payload[key], map)
            if (claim && Object.keys(claim).length > 0) {
                payloadDisclosureMapping[key] = claim
            }
        }
    }

    // If the payload contains a _sd property, it means there's disclosures
    if (payload._sd) {
        if (!Array.isArray(payload._sd)) {
            throw new SdJwtError(
                `Expect value of '_sd' to be of type array, but found ${typeof payload._sd}`
            )
        }

        // We are going to resolve all digests
        for (const digest of payload._sd) {
            if (typeof digest !== 'string') {
                throw new SdJwtError(
                    `Expected entries in '_sd' property to be of type string, found ${typeof digest}`
                )
            }

            // Look up disclosure
            const disclosed = map[digest]
            if (!disclosed) {
                throw new SdJwtError(
                    `Could not find disclosure for digest ${digest}`
                )
            }

            // value is always the last item in the disclosure array
            // We know this is an object, so the associated disclosure MUST have length 3
            const value = [...disclosed.disclosure.decoded].pop()
            if (disclosed.disclosure.decoded.length !== 3) {
                throw new SdJwtError(
                    `Expected disclosure for value ${value} to have 3 items, but found ${disclosed.disclosure.decoded.length}`
                )
            }
            const key = disclosed.disclosure.decoded[1]

            // This checks if there's a nested disclosure anywhere down the tree
            // So when a disclosure value is an object or array, it can contain disclosures
            // of itself (using `_sd` and `...` keys)
            if (isObject(value)) {
                const unpacked = getPayloadDisclosureMapping(value, map)
                if (unpacked && Object.keys(unpacked).length > 0) {
                    payloadDisclosureMapping[key] = {
                        ...unpacked,
                        __digest: digest
                    }
                }
                // If there's no nested disclosures, we add the digest directly
                else {
                    payloadDisclosureMapping[key] = digest
                }
            } else if (Array.isArray(value)) {
                // Get nested disclosures for the array value
                const nestedUnpackedArray = getArrayPayloadDisclosureMapping(
                    value,
                    map
                )

                // If all entries are null, it means there's no nested disclosures
                // And thus we push the digest directly
                if (nestedUnpackedArray.every((item) => item === null)) {
                    payloadDisclosureMapping[key] = digest
                } else {
                    payloadDisclosureMapping[key] = {
                        // This will assign the indexes of the array as keys (so '0': 'value')
                        // And will allow us to still keep the query path (so 'nested.0': 'value')
                        // while also being able to include the `__digest` property to define the
                        // encapsulating disclosure digest
                        ...nestedUnpackedArray,
                        // __digest is for encapsulating disclosure
                        __digest: digest
                    }
                }
            } else {
                payloadDisclosureMapping[key] = digest
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
