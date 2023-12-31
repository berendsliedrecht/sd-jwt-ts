import type { AsyncHasher, Hasher } from '@sd-jwt/types'
import type { Disclosure, DisclosureWithDigest } from '@sd-jwt/types'
import { Base64url, HasherAlgorithm, isPromise } from '@sd-jwt/utils'
import { disclosureToArray } from './toArray'

export type CalculateDigestReturnType<
    HasherImplementation extends Hasher | AsyncHasher
> = ReturnType<HasherImplementation> extends Promise<any>
    ? Promise<DisclosureWithDigest>
    : DisclosureWithDigest

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
