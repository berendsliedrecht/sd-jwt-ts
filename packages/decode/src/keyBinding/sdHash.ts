import type { HasherAndAlgorithm, AsyncHasher, Hasher } from '@sd-jwt/types'
import { Base64url, isPromise } from '@sd-jwt/utils'

export function calculateSdHash<
    HasherImplementation extends Hasher | AsyncHasher
>(
    compactSdJwt: string,
    hasherAndAlgorithm: HasherAndAlgorithm<HasherImplementation>
): ReturnType<HasherImplementation> extends Promise<any>
    ? Promise<string>
    : string {
    // If we don't end with a '~' we probably need to remove the
    // kb-jwt first
    const sdJwtWithoutKbJwt = compactSdJwt.endsWith('~')
        ? compactSdJwt
        : compactSdJwt.split('~').slice(0, -1).join('~') + '~'

    const hashResult = hasherAndAlgorithm.hasher(
        sdJwtWithoutKbJwt,
        hasherAndAlgorithm.algorithm
    )

    return (
        isPromise(hashResult)
            ? hashResult.then((hash) => Base64url.encode(hash))
            : Base64url.encode(hashResult)
    ) as any
}
