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

export type DisclosureFrame<T> = T extends Array<unknown>
    ? {
          [K in keyof T]?: T[K] extends Record<string | number, unknown>
              ? DisclosureFrame<T[K]> | boolean
              : boolean
      }
    : T extends Record<string, unknown>
    ? {
          [K in keyof T]?: T[K] extends Array<unknown>
              ? DisclosureFrame<T[K]> | boolean
              : T[K] extends Record<string, unknown>
              ? ({ __decoyCount?: number } & DisclosureFrame<T[K]>) | boolean
              : boolean
      } & { __decoyCount?: number } & Record<string, unknown>
    : boolean

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

export type SdJwtToCompactOptions<
    DisclosablePayload extends Record<string, unknown>
> = {
    disclosureFrame?: DisclosureFrame<DisclosablePayload>
}
