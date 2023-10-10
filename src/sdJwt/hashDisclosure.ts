import { OrPromise } from '../types'
import { Disclosure } from './disclosures'

import { HasherAlgorithm } from './hasherAlgorithm'

/**
 * A simple hash function that takes the base64url encoded variant of the disclosure and MUST return a base64url encoded version of the digest
 */
export type Hasher = (input: string) => OrPromise<string>
export type HasherAndAlgorithm = {
    hasher: Hasher
    algorithm: string | HasherAlgorithm
}

export const hashDisclosure = async (disclosure: Disclosure, hasher: Hasher) =>
    hasher(disclosure.encoded)
