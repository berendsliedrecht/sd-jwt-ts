import type { AsyncHasher, Hasher, HasherAlgorithm } from '@sd-jwt/types'
import type { Disclosure } from '@sd-jwt/types'
import { Base64url, isPromise } from '@sd-jwt/utils'
import { disclosureToArray } from './toArray'

export type CalculateDigestReturnType<
    HasherImplementation extends Hasher | AsyncHasher
> = ReturnType<HasherImplementation> extends Promise<any>
    ? Promise<string>
    : string

export const disclosureCalculateDigest = <HI extends Hasher | AsyncHasher>(
    disclosure: Disclosure,
    algorithm: HasherAlgorithm,
    hasher: HI
): CalculateDigestReturnType<HI> => {
    const encoded = Base64url.encodeFromJson(disclosureToArray(disclosure))
    const digest = hasher(encoded, algorithm)

    return (
        isPromise(digest)
            ? digest.then(Base64url.encode)
            : Base64url.encode(digest)
    ) as CalculateDigestReturnType<HI>
}
