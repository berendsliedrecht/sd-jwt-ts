import { MakePropertyRequired } from '../types'
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
