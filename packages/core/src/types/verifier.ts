import { OrPromise } from './utils'

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
