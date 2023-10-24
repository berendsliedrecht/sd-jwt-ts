import { ClaimKeyTypeValue, assertClaimInObject } from '../utils'
import {
    Jwt,
    JwtAdditionalOptions,
    JwtOptions,
    JwtVerificationResult
} from '../jwt'
import { SignatureAndEncryptionAlgorithm } from './signatureAndEncryptionAlgorithm'
import { Verifier } from '../sdJwt'

export type KeyBindingHeader<
    H extends Record<string, unknown> = Record<string, unknown>
> = H & {
    typ: 'kb+jwt'
    alg: SignatureAndEncryptionAlgorithm | string
}

export type KeyBindingPayload<
    P extends Record<string, unknown> = Record<string, unknown>
> = P & {
    iat: number
    aud: string
    nonce: string
}

export type KeyBindingOptions<
    H extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
> = JwtOptions<H, P> & {
    header?: KeyBindingHeader<H>
    payload?: KeyBindingPayload<P>
}

export type KeyBindingAdditionalOptions = JwtAdditionalOptions

export type KeyBindingVerificationResult = JwtVerificationResult

export class KeyBinding<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> extends Jwt<KeyBindingHeader<Header>, KeyBindingPayload<Payload>> {
    public constructor(
        options?: KeyBindingOptions<Header, Payload>,
        additionalOptions?: KeyBindingAdditionalOptions
    ) {
        super(options, additionalOptions)
    }

    public static fromJwt<
        Header extends Record<string, unknown> = Record<string, unknown>,
        Payload extends Record<string, unknown> = Record<string, unknown>
    >(jwt: Jwt) {
        const keyBinding = new KeyBinding<Header, Payload>(
            {
                header: jwt.header as KeyBindingHeader<Header>,
                payload: jwt.payload as KeyBindingPayload<Payload>,
                signature: jwt.signature
            },
            { signer: jwt.signer }
        )

        return keyBinding
    }

    public override async verify(
        verifySignature: Verifier<KeyBindingHeader<Header>>,
        requiredClaims?: Array<keyof Payload | string>,
        publicKeyJwk?: Record<string, unknown>
    ): Promise<KeyBindingVerificationResult> {
        this.assertValidForKeyBinding()

        const jwtVerificationResult = await super.verify(
            verifySignature,
            requiredClaims,
            publicKeyJwk
        )

        return jwtVerificationResult
    }

    public static override fromCompact<
        H extends Record<string, unknown> = Record<string, unknown>,
        P extends Record<string, unknown> = Record<string, unknown>
    >(compact: string) {
        const jwt = Jwt.fromCompact<H, P>(compact)
        return KeyBinding.fromJwt<H, P>(jwt)
    }

    public async assertValidForKeyBinding() {
        try {
            this.assertHeader()
            this.assertPayload()

            if (!this.signature) {
                await this.signAndAdd()
            }

            this.assertSignature()

            const requiredHeaderProperties: Array<ClaimKeyTypeValue> = [
                ['typ', 'kb+jwt'],
                ['alg']
            ]

            assertClaimInObject(this.header!, requiredHeaderProperties)

            const requiredPayloadProperties: Array<ClaimKeyTypeValue> = [
                ['iat'],
                ['aud'],
                ['nonce']
            ]

            assertClaimInObject(this.payload!, requiredPayloadProperties)
        } catch (e) {
            if (e instanceof Error) {
                e.message = `jwt is not valid for usage with key binding. Error: ${e.message}`
            }

            throw e
        }
    }
}
