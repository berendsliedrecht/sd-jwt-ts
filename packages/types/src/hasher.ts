import { HasherAlgorithm } from './hasherAlgorithm'

export type Hasher = (data: string, algorithm: string) => Uint8Array

export type AsyncHasher = (
    data: string,
    algorithm: string
) => Promise<Uint8Array>

/**
 * hasher: A simple hash function that takes the base64url encoded variant of the disclosure and returns the digest as a byte array
 * algorithm: IANA defined string for the hashing algorithm used
 */
export type HasherAndAlgorithm<
    HasherImplementation extends Hasher | AsyncHasher = Hasher | AsyncHasher
> = {
    hasher: HasherImplementation
    algorithm: HasherAlgorithm | string
}
