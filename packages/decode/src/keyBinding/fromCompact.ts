import { assertClaimInObject } from '@sd-jwt/utils'
import { jwtFromCompact } from '../jwt'

export const keyBindingFromCompact = <
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
>(
    compact: string
) => {
    const jwt = jwtFromCompact<Header, Payload>(compact)

    try {
        assertClaimInObject(jwt.header, 'typ', 'kb+jwt')
        assertClaimInObject(jwt.header, 'alg')

        assertClaimInObject(jwt.payload, 'iat')
        assertClaimInObject(jwt.payload, 'nonce')
        assertClaimInObject(jwt.payload, 'aud')
    } catch (e) {
        if (e instanceof Error) {
            e.message = `jwt is not valid for usage with key binding. Error: ${e.message}`
        }

        throw e
    }

    return jwt
}
