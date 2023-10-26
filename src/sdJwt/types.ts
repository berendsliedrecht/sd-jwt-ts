import { MakePropertyRequired, OrPromise } from '../types'
import { SdJwt } from './sdJwt'

export type ReturnSdJwtWithHeaderAndPayload<
    H extends Record<string, unknown>,
    P extends Record<string, unknown>,
    T extends SdJwt<H, P>
> = MakePropertyRequired<T, 'header' | 'payload'>

export type ReturnSdJwtWithPayload<
    H extends Record<string, unknown>,
    P extends Record<string, unknown>,
    T extends SdJwt<H, P>
> = MakePropertyRequired<T, 'payload'>

export type ReturnSdJwtWithKeyBinding<
    H extends Record<string, unknown>,
    P extends Record<string, unknown>,
    T extends SdJwt<H, P>
> = MakePropertyRequired<T, 'keyBinding'>

export type VerifyOptions<Header extends Record<string, unknown>> = {
    message: string
    signature: Uint8Array
    header: Header
    /**
     * The public key jwk is included when the `sd-jwt` has the following properties:
     *
     * - A `cnf` claim inside the cleartext payload
     * - A Keybinding at the end
     */
    publicKeyJwk?: Record<string, unknown>
}
export type Verifier<
    Header extends Record<string, unknown> = Record<string, unknown>,
    options extends Record<string, unknown> = VerifyOptions<Header>
> = (options: options) => OrPromise<boolean>
