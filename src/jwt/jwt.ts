import { Base64url } from '../base64url'
import { JwtError } from './error'
import { MakePropertyRequired, OrPromise } from '../types'
import { jwtFromCompact } from './compact'

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
    >(compact: string) {
        // const [compactHeader, compactPayload, encodedSignature] =
        //     compact.split('.')

        // if (!compactHeader || !compactPayload) {
        //     throw new JwtError(
        //         'compact jwt does not contain a header and or payload'
        //     )
        // }

        // const header: Header = Base64url.decodeToJson(compactHeader)
        // const payload: Payload = Base64url.decodeToJson(compactPayload)
        // const signature = encodedSignature
        //     ? Base64url.decode(encodedSignature)
        //     : undefined

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
        this.header = { ...this.header, [item]: value }
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
        this.payload = { ...this.payload, [item]: value }
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
        if (!this.header) {
            throw new JwtError('Header must be defined')
        }
    }

    public assertPayload() {
        if (!this.payload) {
            throw new JwtError('Payload must be defined')
        }
    }

    public assertSignature() {
        if (!this.signature) {
            throw new JwtError('Signature must be defined')
        }
    }

    public assertSigner() {
        if (!this.signer) {
            throw new JwtError(
                'A signer must be provided to create a signature. You can set it with this.withSigner()'
            )
        }
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
}
