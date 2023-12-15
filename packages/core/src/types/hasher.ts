import { HasherAlgorithm } from '@sd-jwt/utils'
import { OrPromise } from './utils'

/**
 * A simple hash function that takes the base64url encoded variant of the disclosure and returns the digest as a byte array
 */
export type Hasher = (input: string) => OrPromise<Uint8Array>

/**
 * hasher: A simple hash function that takes the base64url encoded variant of the disclosure and returns the digest as a byte array
 * algorithm: IANA defined string for the hashing algorithm used
 */
export type HasherAndAlgorithm = {
    hasher: Hasher
    algorithm: string | HasherAlgorithm
}
