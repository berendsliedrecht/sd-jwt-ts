import { Base64url } from '../base64url'
import { JwtError } from './error'
import { MakePropertyRequired, OrPromise } from '../types'
import { jwtFromCompact } from './compact'
import { Verifier } from '../sdJwt/types'
import { getValueByKeyAnyLevel, simpleDeepEqual } from '../utils'

type ReturnJwtWithHeaderAndPayload<
    H extends Record<string, unknown>,
    P extends Record<string, unknown>,
    T extends Jwt<H, P>
> = MakePropertyRequired<T, 'header' | 'payload'>

type ReturnJwtWithHeader<
    H extends Record<string, unknown>,
    P extends Record<string, unknown>,
    T extends Jwt<H, P>
> = MakePropertyRequired<T, 'header'>

type ReturnJwtWithPayload<
    H extends Record<string, unknown>,
    P extends Record<string, unknown>,
    T extends Jwt<H, P>
> = MakePropertyRequired<T, 'payload'>

type ReturnJwtWithSignature<
    H extends Record<string, unknown>,
    P extends Record<string, unknown>,
    T extends Jwt<H, P>
> = MakePropertyRequired<T, 'signature'>

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
    /**
     *
     * non-compact structure for a header of a JWT.
     *
     * Defined in: {@link https://datatracker.ietf.org/doc/html/rfc7519#section-5 | RFC 7519}
     *
     */
    public header?: Header

    /**
     *
     * non-compact structure for a payload of a JWT.
     *
     * Defined in: {@link https://datatracker.ietf.org/doc/html/rfc7519#section-4 | RFC 7519}
     *
     */
    public payload?: Payload

    /**
     *
     * Signature over the BASE64URL(HEADER) || '.' || BASE64URL(PAYLOAD).
     *
     * Defined in: {@link https://datatracker.ietf.org/doc/html/rfc7515 | RFC 7515}
     *
     */
    public signature?: Uint8Array

    /**
     *
     * Callback that will be used when creating a signature over the JWT.
     *
     */
    public signer?: Signer<Header>

    public constructor(
        options?: JwtOptions<Header, Payload>,
        additionalOptions?: JwtAdditionalOptions
    ) {
        this.header = options?.header
        this.payload = options?.payload
        this.signature = options?.signature

        this.signer = additionalOptions?.signer
    }

    /**
     *
     * Instantiate a JWT from a compact format.
     *
     * Two generics may be supplied for typing on the Header and Payload. These are not enforced.
     *
     * Defined in: {@link https://datatracker.ietf.org/doc/html/rfc7519#section-3 | RFC 7519 }
     *
     */
    public static fromCompact<
        Header extends Record<string, unknown> = Record<string, unknown>,
        Payload extends Record<string, unknown> = Record<string, unknown>
    >(compact: string) {
        const { header, payload, signature } = jwtFromCompact<Header, Payload>(
            compact
        )

        const jwt = new Jwt<Header, Payload>({
            header,
            payload,
            signature
        })

        return jwt as ReturnJwtWithHeaderAndPayload<Header, Payload, typeof jwt>
    }

    /**
     *
     * Replaces the current Header a new one.
     *
     */
    public withHeader(
        header: Header
    ): ReturnJwtWithHeader<Header, Payload, this> {
        this.header = header
        return this as ReturnJwtWithHeader<Header, Payload, this>
    }

    /**
     *
     * Add a new claim to the Header, overriding the old one if it already is on there.
     *
     */
    public addHeaderClaim(
        item: keyof Header,
        value: Header[typeof item] | unknown
    ): ReturnJwtWithHeader<Header, Payload, this> {
        this.header ??= {} as Header
        if (value !== undefined && item !== null) {
            this.header = { ...this.header, [item]: value }
        }
        return this as ReturnJwtWithHeader<Header, Payload, this>
    }

    /**
     *
     * Replaces the current Payload a new one.
     *
     */
    public withPayload(
        payload: Payload
    ): ReturnJwtWithPayload<Header, Payload, this> {
        this.payload = payload
        return this as ReturnJwtWithPayload<Header, Payload, this>
    }

    /**
     *
     * Add a new claim to the Payload, overriding the old one if it already is on there.
     *
     */
    public addPayloadClaim(
        item: keyof Payload,
        value: Payload[typeof item] | unknown
    ): ReturnJwtWithPayload<Header, Payload, this> {
        this.payload ??= {} as Payload
        if (value !== undefined && item !== null) {
            this.payload = { ...this.payload, [item]: value }
        }
        return this as ReturnJwtWithPayload<Header, Payload, this>
    }

    /**
     *
     * Manually append a signature to the JWT. This signature is not validated.
     *
     * @note Only use this if the supplying a signing callback does not fit your use case.
     *
     */
    public withSignature(
        signature: Uint8Array
    ): ReturnJwtWithSignature<Header, Payload, this> {
        this.signature = signature
        return this as ReturnJwtWithSignature<Header, Payload, this>
    }

    /**
     *
     * Add a signing callback to the JWT that will be used for creating the signature.
     *
     */
    public withSigner(signer: Signer) {
        this.signer = signer
        return this
    }

    /**
     *
     * Assert that there is a Header on the JWT.
     *
     * @throws when the Header is not defined
     *
     */
    public assertHeader() {
        if (this.header) return

        throw new JwtError('Header must be defined')
    }

    /**
     *
     * Assert that there is a Payload on the JWT.
     *
     * @throws when the Payload is not defined
     *
     */
    public assertPayload() {
        if (this.payload) return

        throw new JwtError('Payload must be defined')
    }

    /**
     *
     * Assert that there is a Signature on the JWT.
     *
     * @throws when the Signature is not defined
     *
     */
    public assertSignature() {
        if (this.signature) return

        throw new JwtError('Signature must be defined')
    }

    /**
     *
     * Assert that there is a Signing callback on the JWT.
     *
     * @throws when the Signer is not defined
     *
     */
    public assertSigner() {
        if (this.signer) return

        throw new JwtError(
            'A signer must be provided to create a signature. You can set it with this.withSigner()'
        )
    }

    /**
     *
     * Assert that there is a specific claim, possibly with value, in the Header.
     *
     */
    public assertClaimInHeader(claimKey: string, claimValue?: unknown) {
        this.assertHeader()

        try {
            this.assertClaimInObject(this.header!, claimKey, claimValue)
        } catch (e) {
            if (e instanceof JwtError) {
                e.message += ' of the header'
            }
            throw e
        }
    }

    /**
     *
     * Assert that there is a specific claim, possibly with value, in the Payload.
     *
     */
    public assertClaimInPayload(claimKey: string, claimValue?: unknown) {
        this.assertPayload()

        try {
            this.assertClaimInObject(this.payload!, claimKey, claimValue)
        } catch (e) {
            if (e instanceof JwtError) {
                e.message += ' of the payload'
            }
            throw e
        }
    }

    private assertClaimInObject(
        object: Record<string, unknown>,
        claimKey: string,
        claimValue?: unknown
    ) {
        const value = getValueByKeyAnyLevel(object, claimKey)

        if (!value) {
            throw new JwtError(`Claim key '${claimKey}' not found in any level`)
        }

        if (claimValue && !simpleDeepEqual(value, claimValue)) {
            throw new JwtError(
                `Claim key '${claimKey}' was found, but values did not match`
            )
        }
    }

    public getClaimInPayload<T>(claimKey: string): T {
        this.assertPayload()
        return this.getClaimInObject<T>(this.payload!, claimKey)
    }

    public getClaimInHeader<T>(claimKey: string): T {
        this.assertHeader()
        return this.getClaimInObject<T>(this.header!, claimKey)
    }

    private getClaimInObject<T>(
        object: Record<string, unknown>,
        claimKey: string
    ): T {
        const value = getValueByKeyAnyLevel<T>(object, claimKey)

        if (!value) {
            throw new JwtError(`Claim key '${claimKey}' not found in any level`)
        }

        return value
    }

    /**
     *
     * Returns a string of what needs to be signed.
     *
     * Defined in: {@link https://datatracker.ietf.org/doc/html/rfc7519#section-3 | RFC 7519}
     *
     */
    public get signableInput() {
        this.assertHeader()
        this.assertPayload()

        return `${this.compactHeader}.${this.compactPayload}`
    }

    /**
     *
     * Sign the Header and Payload and append the signature to the JWT.
     *
     */
    public async signAndAdd(): Promise<
        ReturnJwtWithSignature<Header, Payload, this>
    > {
        this.assertSigner()
        const signature = await this.signer!(this.signableInput, this.header!)
        this.withSignature(signature)

        return this as ReturnJwtWithSignature<Header, Payload, this>
    }

    private get compactHeader() {
        this.assertHeader()
        return Base64url.encodeFromJson(this.header!)
    }

    private get compactPayload() {
        this.assertPayload()
        return Base64url.encodeFromJson(this.payload!)
    }

    /**
     *
     * Create a compact format of the JWT.
     *
     * This will add a signature if there is none.
     *
     * @throws When the signature and signer are not defined
     *
     */
    public async toCompact() {
        this.assertHeader()
        this.assertPayload()

        if (!this.signature) {
            await this.signAndAdd()
        }

        const encodedSignature = Base64url.encode(this.signature!)

        return `${this.compactHeader}.${this.compactPayload}.${encodedSignature}`
    }

    /**
     *
     * Verify the JWT.
     *
     * - Check the nbf claim with `now`
     * - Check the exp claim with `now`
     * - Additionally validate any required claims
     * - Additionally pass in a specific publicKeyJwk to validate the signature
     *
     */
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
