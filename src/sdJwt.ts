import { AllKeys, MakePropertyRequired } from './types'
import { Base64url } from './base64url'
import { SdJwtError } from './error'

type ReturnSdJwtWithHeader<T extends SdJwt> = MakePropertyRequired<T, 'header'>
type ReturnSdJwtWithPayload<T extends SdJwt> = MakePropertyRequired<
  T,
  'payload'
>
type ReturnSdJwtWithSignature<T extends SdJwt> = MakePropertyRequired<
  T,
  'signature'
>

export type SdJwtOptions<
  Header extends Record<string, unknown>,
  Payload extends Record<string, unknown>
> = {
  header?: Header
  payload?: Payload
  signature?: Uint8Array
}

export class SdJwt<
  Header extends Record<string, unknown> = Record<string, unknown>,
  Payload extends Record<string, unknown> = Record<string, unknown>
> {
  public header?: Partial<Header>
  public payload?: Partial<Payload>
  public signature?: Uint8Array
  private disclosableKeys: Array<AllKeys<Payload>> = []
  private decoryDigestCount: number = 0

  public constructor(options?: SdJwtOptions<Header, Payload>) {
    this.header = options?.header
    this.payload = options?.payload
    this.signature = options?.signature
  }

  public static fromCompact<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
  >(compact: string) {
    const [sHeader, sPayload, sSignatureAndDisclosures] = compact.split('.')

    const header = Base64url.decodeToJson<Header>(sHeader)
    const payload = Base64url.decodeToJson<Payload>(sPayload)
    // ignore disclosures for now
    const [sSignature] = sSignatureAndDisclosures.split('~')
    const signature = Base64url.decode(sSignature)

    return new SdJwt({ header, payload, signature })
  }

  public setDecoyDigestCount(decoyDigestCount: number) {
    this.decoryDigestCount = decoyDigestCount
  }

  public withHeader(header: Header): ReturnSdJwtWithHeader<this> {
    this.header = header
    return this as ReturnSdJwtWithHeader<this>
  }

  public addHeader(
    item: keyof Header,
    value: Header[typeof item]
  ): ReturnSdJwtWithHeader<this> {
    this.header ??= {}
    this.header = { [item]: value, ...this.header }
    return this as ReturnSdJwtWithHeader<this>
  }

  public withPayload(payload: Payload): ReturnSdJwtWithPayload<this> {
    this.payload = payload
    return this as ReturnSdJwtWithPayload<this>
  }

  public addPayload(
    item: keyof Payload,
    value: Payload[typeof item]
  ): ReturnSdJwtWithPayload<this> {
    this.payload ??= {}
    this.payload = { [item]: value, ...this.payload }
    return this as ReturnSdJwtWithPayload<this>
  }

  public withSignature(signature: Uint8Array): ReturnSdJwtWithSignature<this> {
    this.signature = signature
    return this as ReturnSdJwtWithSignature<this>
  }

  public addDisclosableKey(item: AllKeys<Payload>) {
    this.disclosableKeys.push(item)
    return this
  }

  public toCompact(): string {
    if (this.disclosableKeys.length > 0) {
      throw new SdJwtError('Disclosable keys are not supported yet')
    }

    if (!this.header) {
      throw new SdJwtError(
        'Header must be defined for moving to compact format'
      )
    }

    if (!this.payload) {
      throw new SdJwtError(
        'Payload must be defined for moving to compact format'
      )
    }

    const sHeader = Base64url.encode(JSON.stringify(this.header))
    const sPayload = Base64url.encode(JSON.stringify(this.payload))
    const sSignature = this.signature ? Base64url.encode(this.signature) : ''

    return `${sHeader}.${sPayload}.${sSignature}`
  }
}
