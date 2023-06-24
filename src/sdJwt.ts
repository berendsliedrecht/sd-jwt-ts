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
  Payload extends Record<string, unknown>
> = {
  header?: Header
  payload?: Payload
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
  Payload extends Record<string, unknown> = Record<string, unknown>
> {
  public header?: Partial<Header>
  public payload?: Partial<Payload & SdJwtPayloadProperties>
  public signature?: Uint8Array

  private saltGenerator?: SaltGenerator
  private hasherAndAlgorithm?: HasherAndAlgorithm

  private disclosurePaths: Array<{ key: string; path: string }> = []
  private decoryDigestCount: number = 0

  public constructor(
    options?: SdJwtOptions<Header, Payload>,
    additionalOptions?: SdJwtAdditionalOptions
  ) {
    this.header = options?.header
    this.payload = options?.payload
    this.signature = options?.signature

    this.saltGenerator = additionalOptions?.saltGenerator
    this.hasherAndAlgorithm = additionalOptions?.hasherAndAlgorithm
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

    this.addPayload('_sd_alg', hasherAndAlgorithm.algorithm)

    return this as ReturnSdJwtWithPayload<this>
  }

  public withHeader(header: Header): ReturnSdJwtWithHeader<this> {
    this.header = header
    return this as ReturnSdJwtWithHeader<this>
  }

  public addHeader(
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

  public addPayload(
    item: keyof Payload,
    value: Payload[typeof item] | unknown
  ): ReturnSdJwtWithPayload<this> {
    this.payload ??= {}
    this.payload = { [item]: value, ...this.payload }
    return this as ReturnSdJwtWithPayload<this>
  }

  public withSignature(signature: Uint8Array): ReturnSdJwtWithSignature<this> {
    this.signature = signature
    return this as ReturnSdJwtWithSignature<this>
  }

  public addDisclosurePath(
    options:
      | { key: string; path: string }
      | Array<{ key: string; path: string }>
  ) {
    const optionsAsArray = Array.isArray(options) ? options : [options]
    optionsAsArray.forEach(({ key, path }) => {
      const items = jp.query(this.payload, path)
      if (items.length === 0) {
        throw new SdJwtError(
          `Invalid json path provided for key '${key}' with path '${path}'`
        )
      }

      this.disclosurePaths.push({ key, path })
    })
    return this
  }

  public addDisclosurePathUnsafe(options: { key: string; path: string }) {
    try {
      this.addDisclosurePath(options)
    } finally {
      return this
    }
  }

  private createDisclosure(key: string, path: string): string {
    if (!this.saltGenerator) {
      throw new SdJwtError(
        'Cannot create a disclosure without a salt generator. You can set it with this.withSaltGenerator()'
      )
    }

    const [item] = jp.query(this.payload, path, 1)
    if (!item) {
      throw new SdJwtError(`Could not find item in payload for query '${path}'`)
    }

    const disclosure = [this.saltGenerator(key), key, item]

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

  private addDiscolsureDigest(digest: string) {
    const digests: Array<string> = this.payload?._sd ?? []
    digests.push(digest)
    this.addPayload('_sd', digests)
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

    const disclosures = this.disclosurePaths
      .concat(options?.additionalDisclosablePaths ?? [])
      .map(({ key, path }) => {
        const disclosure = this.createDisclosure(key, path)
        const digest = this.hashDisclosure(disclosure)
        this.addDiscolsureDigest(digest)
        return disclosure
      })

    const sHeader = Base64url.encode(JSON.stringify(this.header))
    const sPayload = Base64url.encode(JSON.stringify(this.payload))
    const sSignature = this.signature ? Base64url.encode(this.signature) : ''
    const sDisclosures =
      disclosures.length > 0 ? `~${disclosures.join('~')}~` : ''

    return `${sHeader}.${sPayload}.${sSignature}${sDisclosures}`
  }
}
