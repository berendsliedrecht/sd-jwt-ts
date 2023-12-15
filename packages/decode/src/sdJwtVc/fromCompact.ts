import { assertClaimInObject } from '@sd-jwt/utils'
import { sdJwtFromCompact } from '../sdJwt/fromCompact'

export const sdJwtVcFromCompact = <
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
>(
    compact: string
) => {
    const sdJwt = sdJwtFromCompact<Header, Payload>(compact)

    try {
        assertClaimInObject(sdJwt.header, 'typ', 'vc+sd-jwt')
        assertClaimInObject(sdJwt.header, 'alg')
        assertClaimInObject(sdJwt.payload, 'iss')
        assertClaimInObject(sdJwt.payload, 'vct')
        assertClaimInObject(sdJwt.payload, 'iat')
        assertClaimInObject(sdJwt.payload, 'cnf')
    } catch (e) {
        if (e instanceof Error) {
            e.message = `jwt is not valid for usage with sd-jwt-vc. Error: ${e.message}`
        }

        throw e
    }

    return sdJwt
}
