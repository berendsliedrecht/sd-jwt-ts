import { Base64url } from '@sd-jwt/utils'

export const jwtFromCompact = <
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
>(
    compact: string
) => {
    if (compact.includes('~')) {
        throw new Error(
            'compact JWT includes `~` which is only allowed in an sd-jwt. Please use sdJwtFromCompact() instead.'
        )
    }

    if ((compact.match(/\./g) || []).length !== 2) {
        throw new Error('compact JWT must include two periods (.)')
    }

    const [compactHeader, compactPayload, encodedSignature] = compact.split('.')

    if (!encodedSignature || encodedSignature.length === 0) {
        throw new Error(
            'A signature must be provided within the context of sd-jwt'
        )
    }

    const header = Base64url.decodeToJson<Header>(compactHeader)
    const payload = Base64url.decodeToJson<Payload>(compactPayload)
    const signature = Base64url.decode(encodedSignature)

    return {
        header,
        payload,
        signature
    }
}
