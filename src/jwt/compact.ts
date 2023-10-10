import { Base64url } from '../base64url'
import { JwtError } from './error'

export type ExpandedJwt<
    H extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
> = {
    header: H
    payload: P
    signature: Uint8Array
}

export const jwtFromCompact = <
    H extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
>(
    compact: string
): ExpandedJwt<H, P> => {
    if (compact.includes('~')) {
        throw new JwtError(
            'compact JWT includes `~` which is only allowed in an sd-jwt. Please use sdJwtFromCompact() instead.'
        )
    }

    if ((compact.match(/\./g) || []).length !== 2) {
        throw new JwtError('compact JWT must include two periods (.)')
    }

    const [compactHeader, compactPayload, encodedSignature] = compact.split('.')

    const header = Base64url.decodeToJson<H>(compactHeader)
    const payload = Base64url.decodeToJson<P>(compactPayload)
    const signature = Base64url.decode(encodedSignature)

    return {
        header,
        payload,
        signature
    }
}
