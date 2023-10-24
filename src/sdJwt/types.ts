import { MakePropertyRequired, OrPromise } from '../types'
import { SdJwt } from './sdJwt'

export type ReturnSdJwtWithHeaderAndPayload<T extends SdJwt> =
    MakePropertyRequired<T, 'header' | 'payload'>

export type ReturnSdJwtWithPayload<T extends SdJwt> = MakePropertyRequired<
    T,
    'payload'
>

export type ReturnSdJwtWithKeyBinding<T extends SdJwt> = MakePropertyRequired<
    T,
    'keyBinding'
>

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

export type Signer<
    Header extends Record<string, unknown> = Record<string, unknown>
> = (input: string, header: Header) => OrPromise<Uint8Array>
