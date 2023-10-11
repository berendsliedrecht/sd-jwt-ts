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
}
export type Verifier<Header extends Record<string, unknown>> = (
    options: VerifyOptions<Header>
) => OrPromise<boolean>

export type Signer<
    Header extends Record<string, unknown> = Record<string, unknown>
> = (input: string, header: Header) => OrPromise<Uint8Array>
