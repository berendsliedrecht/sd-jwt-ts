import { MakePropertyRequired } from './types'
import { Base64url } from './base64url'
import { SdJwtError } from './error'
import { HasherAlgorithm } from './hasherAlgorithm'
import jp from 'jsonpath'

type ReturnSdJwtWithHeader<T extends SdJwt> = MakePropertyRequired<T, 'header'>
type ReturnSdJwtWithPayload<T extends SdJwt> = MakePropertyRequired<
  T,
  'payload'
>
type ReturnSdJwtWithDisclosablePayload<T extends SdJwt> = MakePropertyRequired<
  T,
  'disclosablePayload'
>
type ReturnSdJwtWithSignature<T extends SdJwt> = MakePropertyRequired<
  T,
  'signature'
>

/**
 * A simple hash function that takes the base64url encoded variant of the disclosure and MUST return a base64url encoded version of the digest
 */
export type Hasher = (input: string) => string
export type HasherAndAlgorithm = {
  hasher: Hasher
  algorithm: string | HasherAlgorithm
}

/**
 * Key should not be used to generate the salt as it needs to be unique. It is used for testing here
 */
export type SaltGenerator = (key: string) => string

export type SdJwtToCompactOptions = {
  additionalDisclosablePaths?: Array<{ key: string; path: string }>
}

export type SdJwtOptions<
  Header extends Record<string, unknown>,
  Payload extends Record<string, unknown>,
  DisclosablePayload extends Record<string, unknown>
> = {
  header?: Header
  payload?: Payload
  disclosablePayload?: DisclosablePayload
  signature?: Uint8Array
}

export type SdJwtAdditionalOptions = {
  hasherAndAlgorithm?: HasherAndAlgorithm
  saltGenerator?: SaltGenerator
}

export type SdJwtPayloadProperties = {
  _sd_alg?: string | HasherAlgorithm
  _sd?: Array<string>
}

export class SdJwt<
  Header extends Record<string, unknown> = Record<string, unknown>,
  Payload extends Record<string, unknown> = Record<string, unknown>,
  DisclosablePayload extends Record<string, unknown> = Record<string, unknown>
> {
  public header?: Partial<Header>
  public payload?: Partial<Payload & SdJwtPayloadProperties>
  public disclosablePayload?: Partial<DisclosablePayload>
  public signature?: Uint8Array

  private saltGenerator?: SaltGenerator
  private hasherAndAlgorithm?: HasherAndAlgorithm

  private decoryDigestCount: number = 0

  public constructor(
    options?: SdJwtOptions<Header, Payload, DisclosablePayload>,
    additionalOptions?: SdJwtAdditionalOptions
  ) {
    this.header = options?.header
    this.payload = options?.payload
    this.disclosablePayload = options?.disclosablePayload
    this.signature = options?.signature

    if (additionalOptions?.hasherAndAlgorithm) {
      this.withHasher(additionalOptions.hasherAndAlgorithm)
    }

    if (additionalOptions?.saltGenerator) {
      this.withSaltGenerator(additionalOptions.saltGenerator)
    }
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

  public withDecoyDigestCount(decoyDigestCount: number) {
    this.decoryDigestCount = decoyDigestCount
    return this
  }

  public withSaltGenerator(saltGenerator: SaltGenerator) {
    this.saltGenerator = saltGenerator
    return this
  }

  public withHasher(
    hasherAndAlgorithm: HasherAndAlgorithm
  ): ReturnSdJwtWithPayload<this> {
    this.hasherAndAlgorithm = hasherAndAlgorithm

    this.addPayloadClaim('_sd_alg', hasherAndAlgorithm.algorithm)

    return this as ReturnSdJwtWithPayload<this>
  }

  public withHeader(header: Header): ReturnSdJwtWithHeader<this> {
    this.header = header
    return this as ReturnSdJwtWithHeader<this>
  }

  public addHeaderClaim(
    item: keyof Header,
    value: Header[typeof item] | unknown
  ): ReturnSdJwtWithHeader<this> {
    this.header ??= {}
    this.header = { [item]: value, ...this.header }
    return this as ReturnSdJwtWithHeader<this>
  }

  public withPayload(payload: Payload): ReturnSdJwtWithPayload<this> {
    this.payload = payload
    return this as ReturnSdJwtWithPayload<this>
  }

  public withDisclosablePayload(
    disclosablePayload: DisclosablePayload
  ): ReturnSdJwtWithDisclosablePayload<this> {
    this.disclosablePayload = disclosablePayload
    return this as ReturnSdJwtWithDisclosablePayload<this>
  }

  public addPayloadClaim(
    item: keyof Payload,
    value: Payload[typeof item] | unknown
  ): ReturnSdJwtWithPayload<this> {
    this.payload ??= {}
    this.payload = { [item]: value, ...this.payload }
    return this as ReturnSdJwtWithPayload<this>
  }

  public addDisclosablePayloadClaim(
    item: keyof DisclosablePayload,
    value: DisclosablePayload[typeof item] | unknown
  ): ReturnSdJwtWithDisclosablePayload<this> {
    this.disclosablePayload ??= {}
    this.disclosablePayload = { [item]: value, ...this.disclosablePayload }
    return this as ReturnSdJwtWithDisclosablePayload<this>
  }

  public withSignature(signature: Uint8Array): ReturnSdJwtWithSignature<this> {
    this.signature = signature
    return this as ReturnSdJwtWithSignature<this>
  }

  private createDisclosure(key: string, value: unknown): string {
    if (!this.saltGenerator) {
      throw new SdJwtError(
        'Cannot create a disclosure without a salt generator. You can set it with this.withSaltGenerator()'
      )
    }

    const disclosure = [this.saltGenerator(key), key, value]

    return Base64url.encode(JSON.stringify(disclosure))
  }

  private hashDisclosure(disclosure: string): string {
    if (!this.hasherAndAlgorithm) {
      throw new SdJwtError(
        'A hasher and algorithm must be set in order to create a digest of a disclosure. You can set it with this.withHasherAndAlgorithm()'
      )
    }

    return this.hasherAndAlgorithm.hasher(disclosure)
  }

  private addDiscolsureDigestClaim(
    digest: string,
    base: Record<string, unknown> | undefined = this.payload
  ): ReturnSdJwtWithPayload<this> {
    if (base) {
      const digests: Array<string> = (base?._sd as Array<string>) ?? []
      digests.push(digest)
      base._sd = digests
    } else {
      const digests: Array<string> = (this.payload?._sd as Array<string>) ?? []
      digests.push(digest)
      this.addPayloadClaim('_sd', digests)
    }

    return this as ReturnSdJwtWithPayload<this>
  }

  private createAndAddDisclosures(): Array<string> {
    return Object.entries(this.disclosablePayload ?? {}).map(([key, value]) => {
      const disclosure = this.createDisclosure(key, value)
      const digest = this.hashDisclosure(disclosure)
      this.addDiscolsureDigestClaim(digest)

      return disclosure
    })
  }

  public toCompact(options?: SdJwtToCompactOptions): string {
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

    const disclosures = this.createAndAddDisclosures()

    const sHeader = Base64url.encode(JSON.stringify(this.header))
    const sPayload = Base64url.encode(JSON.stringify(this.payload))
    const sSignature = this.signature ? Base64url.encode(this.signature) : ''
    const sDisclosures =
      disclosures.length > 0 ? `~${disclosures.join('~')}~` : ''

    return `${sHeader}.${sPayload}.${sSignature}${sDisclosures}`
  }
}
