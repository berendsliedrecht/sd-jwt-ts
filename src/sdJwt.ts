import { MakePropertyRequired } from './types'
import { Base64url } from './base64url'
import { SdJwtError } from './error'
import { HasherAlgorithm } from './hasherAlgorithm'
import { deleteByPath } from './util'

type ReturnSdJwtWithHeader<T extends SdJwt> = MakePropertyRequired<T, 'header'>
type ReturnSdJwtWithPayload<T extends SdJwt> = MakePropertyRequired<
  T,
  'payload'
>
type ReturnSdJwtWithSignature<T extends SdJwt> = MakePropertyRequired<
  T,
  'signature'
>

export type DisclosureFrame<DP> = {
  [K in keyof DP]?: DP[K] extends Record<string, unknown>
    ? ({ __decoyCount?: number } & DisclosureFrame<DP[K]>) | boolean
    : boolean
} & { __decoyCount?: number }

export type DisclosurePayload<DP> = {
  [K in keyof DP]?: DP[K] extends Record<string, unknown>
    ? CommonSdJwtPayloadProperties & DisclosureFrame<DP[K]>
    : DP[K]
}

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

export type Signer<Header extends Record<string, unknown>> = (
  input: string,
  header: Header
) => Uint8Array

export type SdJwtToCompactOptions<
  DisclosablePayload extends Record<string, unknown>
> = {
  disclosureFrame?: DisclosureFrame<DisclosablePayload>
}

export type SdJwtOptions<
  Header extends Record<string, unknown>,
  Payload extends Record<string, unknown>
> = {
  header?: Header
  payload?: Payload
  signature?: Uint8Array
}

export type SdJwtAdditionalOptions<DP extends Record<string, unknown>> = {
  hasherAndAlgorithm?: HasherAndAlgorithm
  saltGenerator?: SaltGenerator
  disclosureFrame?: DisclosureFrame<DP>
}

type CommonSdJwtPayloadProperties = {
  _sd_alg?: string | HasherAlgorithm
  _sd?: Array<string>
}

type CommonSdJwtHeaderProperties = {
  alg?: string
  jwk?: Record<string, unknown>
  kid?: string
}

export class SdJwt<
  Header extends Record<string, unknown> = Record<string, unknown>,
  Payload extends Record<string, unknown> = Record<string, unknown>
> {
  public header?: Partial<Header & CommonSdJwtHeaderProperties>
  public payload?: Partial<Payload & CommonSdJwtPayloadProperties>
  public signature?: Uint8Array

  private saltGenerator?: SaltGenerator
  private signer?: Signer
  private hasherAndAlgorithm?: HasherAndAlgorithm
  private disclosureFrame?: DisclosureFrame<Payload>

  public constructor(
    options?: SdJwtOptions<Header, Payload>,
    additionalOptions?: SdJwtAdditionalOptions<Payload>
  ) {
    this.header = options?.header
    this.payload = options?.payload
    this.signature = options?.signature

    if (additionalOptions?.hasherAndAlgorithm) {
      this.withHasher(additionalOptions.hasherAndAlgorithm)
    }

    if (additionalOptions?.saltGenerator) {
      this.withSaltGenerator(additionalOptions.saltGenerator)
    }

    if (additionalOptions?.disclosureFrame) {
      this.withDisclosureFrame(additionalOptions.disclosureFrame)
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

    return new SdJwt<Header, Payload>({
      header,
      payload,
      signature,
    })
  }

  public withSaltGenerator(saltGenerator: SaltGenerator) {
    this.saltGenerator = saltGenerator
    return this
  }

  public withSigner(signer: Signer<Header>) {
    this.signer = signer
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

  public withDisclosureFrame(disclosureFrame: DisclosureFrame<Payload>) {
    this.disclosureFrame = disclosureFrame
    return this
  }

  public addPayloadClaim(
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

  private createDisclosure(key: string, value: unknown): string {
    this.assertSaltGenerator()

    const disclosure = [this.saltGenerator!(key), key, value]

    return Base64url.encode(JSON.stringify(disclosure))
  }

  private hashDisclosure(disclosure: string): string {
    this.assertHashAndAlgorithm()

    return this.hasherAndAlgorithm!.hasher(disclosure)
  }

  private createDecoy(count: number): Array<string> {
    this.assertSaltGenerator()
    this.assertPayload()

    const decoys: Array<string> = []
    for (let i = 0; i < count; i++) {
      decoys.push(this.hashDisclosure(this.saltGenerator!(i.toString())))
    }
    return decoys
  }

  private applyDisclosureFrame(
    object: Payload,
    frame: DisclosureFrame<Payload>,
    disclosures: Array<string> = [],
    keys: Array<string> = [],
    cleanup: Array<Array<string>> = []
  ): { disclosures: Array<string>; payload: Record<string, unknown> } {
    Object.entries(frame).forEach(([key, value]) => {
      const newKeys = [...keys, key]
      if (key === '__decoyCount' && typeof value === 'number') {
        const sd: Array<string> = Array.from((object._sd as string[]) ?? [])
        this.createDecoy(value).forEach((digest) => sd.push(digest))
        // @ts-ignore
        object._sd = sd
      } else if (typeof value === 'boolean') {
        if (value === true) {
          const sd: Array<string> = Array.from((object._sd as string[]) ?? [])
          const disclosure = this.createDisclosure(key, object[key])
          disclosures.push(disclosure)
          const digest = this.hashDisclosure(disclosure)
          sd.push(digest)
          //@ts-ignore
          object._sd = sd
          cleanup.push(newKeys)
        }
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        this.applyDisclosureFrame(
          object[key] as Payload,
          value as DisclosureFrame<Payload>,
          disclosures,
          newKeys,
          cleanup
        )
      } else {
        throw new SdJwtError(
          `Invalid type in frame with key '${key}' and type '${typeof value}'. Only Record<string, unknown> and boolean are allowed.`
        )
      }
    })

    const payloadClone = { ...object }
    cleanup.forEach((path) => {
      deleteByPath(payloadClone, path.join('.'))
    })

    return { disclosures, payload: payloadClone }
  }

  private assertHeader() {
    if (!this.header) {
      throw new SdJwtError('Header must be defined')
    }
  }

  private assertPayload() {
    if (!this.payload) {
      throw new SdJwtError('Payload must be defined')
    }
  }

  private assertSaltGenerator() {
    if (!this.saltGenerator) {
      throw new SdJwtError(
        'Cannot create a disclosure without a salt generator. You can set it with this.withSaltGenerator()'
      )
    }
  }

  private assertHashAndAlgorithm() {
    if (!this.hasherAndAlgorithm) {
      throw new SdJwtError(
        'A hasher and algorithm must be set in order to create a digest of a disclosure. You can set it with this.withHasherAndAlgorithm()'
      )
    }
  }

  private assertSigner() {
    if (!this.signer) {
      throw new SdJwtError(
        'A signer must be provided to create a signature. You can set it with this.withSigner()'
      )
    }
  }

  public get signableInput() {
    this.assertSigner()
    return `${this.compactHeader}.${this.compactPayload}`
  }

  public signAndAdd(): ReturnSdJwtWithSignature<this> {
    const signature = this.signer(this.signableInput, this.header!)
    this.withSignature(signature)

    return this as ReturnSdJwtWithSignature<this>
  }

  private get compactHeader() {
    this.assertHeader()
    return Base64url.encodeFromJson(this.header!)
  }

  private get compactPayload() {
    this.assertPayload()
    return Base64url.encodeFromJson(this.payload!)
  }

  public toCompact(options?: SdJwtToCompactOptions<Payload>): string {
    this.assertHeader()
    this.assertPayload()

    const frame = options?.disclosureFrame ?? this.disclosureFrame

    const { disclosures, payload } = frame
      ? this.applyDisclosureFrame(
          { ...this.payload } as Payload,
          frame as DisclosureFrame<Payload>
        )
      : { disclosures: [], payload: this.payload }

    const sHeader = Base64url.encode(JSON.stringify(this.header))
    const sPayload = Base64url.encode(JSON.stringify(payload))
    const sSignature = this.signature ? Base64url.encode(this.signature) : ''
    const sDisclosures =
      disclosures.length > 0 ? `~${disclosures.join('~')}~` : ''

    return `${sHeader}.${sPayload}.${sSignature}${sDisclosures}`
  }
}
