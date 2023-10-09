import { Base64url } from './base64url'
import { JwtError } from './error'
import { MakePropertyRequired, OrPromise } from './types'

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

export type AdditionalJwtOptions<
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
    private signer?: Signer

    public constructor(
        options?: JwtOptions<Header, Payload>,
        additionalOptions?: AdditionalJwtOptions
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
        const [compactHeader, compactPayload, encodedSignature] =
            compact.split('.')

        if (!compactHeader || !compactPayload) {
            throw new JwtError(
                'compact jwt does not contain a header and or payload'
            )
        }

        const header: Header = Base64url.decodeToJson(compactHeader)
        const payload: Payload = Base64url.decodeToJson(compactPayload)
        const signature = encodedSignature
            ? Base64url.decode(encodedSignature)
            : undefined

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

    private assertHeader() {
        if (!this.header) {
            throw new JwtError('Header must be defined')
        }
    }

    private assertPayload() {
        if (!this.payload) {
            throw new JwtError('Payload must be defined')
        }
    }

    private assertSignature() {
        if (!this.signature) {
            throw new JwtError('Signature must be defined')
        }
    }

    private assertSigner() {
        if (!this.signer) {
            throw new JwtError('Signer must be defined')
        }
    }

    public get signableInput() {
        this.assertHeader()
        this.assertPayload()

        return `${this.compactHeader}.${this.compactPayload}`
    }

    public async signAndAdd() {
        this.assertSigner()
        this.assertHeader()

        this.signature = await this.signer!(this.signableInput, this.header!)
    }

    private get compactHeader() {
        this.assertHeader()
        return Base64url.encodeFromJson(this.header!)
    }

    private get compactPayload() {
        this.assertPayload()
        return Base64url.encodeFromJson(this.payload!)
    }

    public assertValidForKeyBinding() {
        try {
            this.assertHeader()
            this.assertPayload()
            this.assertSignature()

            const requiredHeaderProperties = [
                ['typ', 'string', 'kb+jwt'],
                ['alg', 'string']
            ]
            const headerKeys = Object.keys(this.header!)

            for (const [
                requiredHeaderProperty,
                requiredHeaderPropertyType,
                requiredHeaderPropertyValue
            ] of requiredHeaderProperties) {
                if (!headerKeys.includes(requiredHeaderProperty)) {
                    throw new JwtError(
                        `Header does not include a required property '${requiredHeaderProperty}'`
                    )
                }

                const headerValue = this.header![requiredHeaderProperty]
                const headerType = typeof headerValue

                if (headerType !== requiredHeaderPropertyType) {
                    throw new JwtError(
                        `Header includes the required property '${requiredHeaderProperty}', but there is a type mistmatch. Expected: '${requiredHeaderPropertyType}', actual: '${headerType}'`
                    )
                }

                if (
                    requiredHeaderPropertyValue &&
                    headerValue !== requiredHeaderPropertyValue
                ) {
                    throw new JwtError(
                        `Header includes the required property '${requiredHeaderProperty}', but there is a value mistmatch. Expected: '${requiredHeaderPropertyValue}', actual: '${headerValue}'`
                    )
                }
            }

            const requiredPayloadProperties = [
                ['iat', 'number'],
                ['aud', 'string'],
                ['nonce', 'string']
            ]
            const payloadKeys = Object.keys(this.payload!)

            for (const [
                requiredPayloadProperty,
                requiredPayloadPropertyType,
                requiredPayloadPropertyValue
            ] of requiredPayloadProperties) {
                if (!payloadKeys.includes(requiredPayloadProperty)) {
                    throw new JwtError(
                        `Payload does not include a required property '${requiredPayloadProperty}'`
                    )
                }

                const payloadValue = this.payload![requiredPayloadProperty]
                const payloadType = typeof payloadValue

                if (payloadType !== requiredPayloadPropertyType) {
                    throw new JwtError(
                        `Payload includes the required property '${requiredPayloadProperty}', but there is a type mistmatch. Expected: '${requiredPayloadPropertyType}', actual: '${payloadType}'`
                    )
                }

                if (
                    requiredPayloadPropertyValue &&
                    payloadValue !== requiredPayloadPropertyValue
                ) {
                    throw new JwtError(
                        `Payload includes the required property '${requiredPayloadProperty}', but there is a value mistmatch. Expected: '${requiredPayloadPropertyValue}', actual: '${payloadValue}'`
                    )
                }
            }
        } catch (e) {
            if (e instanceof JwtError) {
                e.message = `jwt is not valid for usage with key binding. Error: ${e.message}`
            }

            throw e
        }
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
