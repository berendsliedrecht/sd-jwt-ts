import { Base64url } from '../base64url'
import { JwtError } from './error'
import { MakePropertyRequired, OrPromise } from '../types'
import { jwtFromCompact } from './compact'
import { Verifier } from '../sdJwt/types'

type ReturnJwtWithHeaderAndPayload<T extends Jwt> = MakePropertyRequired<
    T,
    'header' | 'payload'
>
type ReturnJwtWithHeader<T extends Jwt> = MakePropertyRequired<T, 'header'>
type ReturnJwtWithPayload<T extends Jwt> = MakePropertyRequired<T, 'payload'>
type ReturnJwtWithSignature<T extends Jwt> = MakePropertyRequired<
    T,
    'signature'
>

export type JwtOptions<
    H extends Record<string, unknown>,
    P extends Record<string, unknown>
> = {
    header?: H
    payload?: P
    signature?: Uint8Array
}

export type JwtAdditionalOptions<
    Header extends Record<string, unknown> = Record<string, unknown>
> = {
    signer?: Signer<Header>
}

export type Signer<
    Header extends Record<string, unknown> = Record<string, unknown>
> = (input: string, header: Header) => OrPromise<Uint8Array>

export type JwtVerificationResult = {
    isValid: boolean
    isSignatureValid: boolean
    isNotBeforeValid?: boolean
    isExpiryTimeValid?: boolean
    areRequiredClaimsIncluded?: boolean
}

export class Jwt<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> {
    public header?: Header
    public payload?: Payload
    public signature?: Uint8Array

    // TODO: `Signer` type should take the `Header` generic
    public signer?: Signer

    public constructor(
        options?: JwtOptions<Header, Payload>,
        additionalOptions?: JwtAdditionalOptions
    ) {
        this.header = options?.header
        this.payload = options?.payload
        this.signature = options?.signature

        this.signer = additionalOptions?.signer
    }

    public static fromCompact<
        Header extends Record<string, unknown> = Record<string, unknown>,
        Payload extends Record<string, unknown> = Record<string, unknown>
    >(compact: string): Jwt {
        const { header, payload, signature } = jwtFromCompact<Header, Payload>(
            compact
        )

        const jwt = new Jwt<Header, Payload>({
            header,
            payload,
            signature
        })

        return jwt as ReturnJwtWithHeaderAndPayload<typeof jwt>
    }

    public withHeader(header: Header): ReturnJwtWithHeader<this> {
        this.header = header
        return this as ReturnJwtWithHeader<this>
    }

    public addHeaderClaim(
        item: keyof Header,
        value: Header[typeof item] | unknown
    ): ReturnJwtWithHeader<this> {
        this.header ??= {} as Header
        if (value !== undefined && item !== null) {
            this.header = { ...this.header, [item]: value }
        }
        return this as ReturnJwtWithHeader<this>
    }

    public withPayload(payload: Payload): ReturnJwtWithPayload<this> {
        this.payload = payload
        return this as ReturnJwtWithPayload<this>
    }

    public addPayloadClaim(
        item: keyof Payload,
        value: Payload[typeof item] | unknown
    ): ReturnJwtWithPayload<this> {
        this.payload ??= {} as Payload
        if (value !== undefined && item !== null) {
            this.payload = { ...this.payload, [item]: value }
        }
        return this as ReturnJwtWithPayload<this>
    }

    public withSignature(signature: Uint8Array): ReturnJwtWithSignature<this> {
        this.signature = signature
        return this as ReturnJwtWithSignature<this>
    }

    public withSigner(signer: Signer) {
        this.signer = signer
        return this
    }

    public assertHeader() {
        if (this.header) return

        throw new JwtError('Header must be defined')
    }

    public assertPayload() {
        if (this.payload) return

        throw new JwtError('Payload must be defined')
    }

    public assertSignature() {
        if (this.signature) return

        throw new JwtError('Signature must be defined')
    }

    public assertSigner() {
        if (this.signer) return

        throw new JwtError(
            'A signer must be provided to create a signature. You can set it with this.withSigner()'
        )
    }

    public get signableInput() {
        this.assertHeader()
        this.assertPayload()

        return `${this.compactHeader}.${this.compactPayload}`
    }

    public async signAndAdd(): Promise<ReturnJwtWithSignature<this>> {
        this.assertSigner()
        const signature = await this.signer!(this.signableInput, this.header!)
        this.withSignature(signature)

        return this as ReturnJwtWithSignature<this>
    }

    private get compactHeader() {
        this.assertHeader()
        return Base64url.encodeFromJson(this.header!)
    }

    private get compactPayload() {
        this.assertPayload()
        return Base64url.encodeFromJson(this.payload!)
    }

    public async toCompact() {
        this.assertHeader()
        this.assertPayload()

        if (!this.signature) {
            await this.signAndAdd()
        }

        const encodedSignature = Base64url.encode(this.signature!)

        return `${this.compactHeader}.${this.compactPayload}.${encodedSignature}`
    }

    public async verify(
        verifySignature: Verifier<Header>,
        requiredClaims?: Array<keyof Payload | string>,
        publicKeyJwk?: Record<string, unknown>
    ): Promise<JwtVerificationResult> {
        this.assertHeader()
        this.assertPayload()
        this.assertSignature()

        const ret: Partial<JwtVerificationResult> = {}

        ret.isSignatureValid = await verifySignature({
            header: this.header!,
            signature: this.signature!,
            message: this.signableInput,
            publicKeyJwk
        })

        if ('nbf' in this.payload!) {
            const now = new Date()
            const notBefore = new Date((this.payload!.nbf as number) * 1000)

            ret.isNotBeforeValid = notBefore < now
        }

        if ('exp' in this.payload!) {
            const now = new Date()
            const expiryTime = new Date((this.payload!.exp as number) * 1000)

            ret.isExpiryTimeValid = expiryTime > now
        }

        if (requiredClaims) {
            ret.areRequiredClaimsIncluded = requiredClaims.every(
                (claim) => claim in this.payload!
            )
        }

        ret.isValid = Object.values(ret)
            .filter((i) => typeof i === 'boolean')
            .every((i) => !!i)

        return ret as JwtVerificationResult
    }
}
