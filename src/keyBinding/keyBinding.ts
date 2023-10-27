import {
    Jwt,
    JwtAdditionalOptions,
    JwtOptions,
    JwtVerificationResult,
    Signer
} from '../jwt'
import { SignatureAndEncryptionAlgorithm } from './signatureAndEncryptionAlgorithm'
import { Verifier } from '../sdJwt'
import { MakePropertyRequired } from '../types'

type ReturnKeyBindingWithHeaderAndPayload<
    H extends Record<string, unknown>,
    P extends Record<string, unknown>,
    T extends KeyBinding<H, P>
> = MakePropertyRequired<T, 'header' | 'payload'>

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
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> = JwtOptions<KeyBindingHeader<Header>, KeyBindingPayload<Payload>>

export type KeyBindingAdditionalOptions<
    Header extends Record<string, unknown> = Record<string, unknown>
> = JwtAdditionalOptions<KeyBindingHeader<Header>>

export type KeyBindingVerificationResult = JwtVerificationResult

export class KeyBinding<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> extends Jwt<Header, Payload> {
    public override signer?: Signer<Header>

    public constructor(
        options?: KeyBindingOptions<Header, Payload>,
        additionalOptions?: KeyBindingAdditionalOptions<Header>
    ) {
        super(options)

        this.signer = additionalOptions?.signer as Signer<Header>
    }

    public static fromJwt<
        Header extends Record<string, unknown> = Record<string, unknown>,
        Payload extends Record<string, unknown> = Record<string, unknown>
    >(jwt: Jwt<Header, Payload>): KeyBinding<Header, Payload> {
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
        verifySignature: Verifier<Header>,
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
        Header extends Record<string, unknown> = Record<string, unknown>,
        Payload extends Record<string, unknown> = Record<string, unknown>
    >(compact: string) {
        const jwt = Jwt.fromCompact<Header, Payload>(compact)
        const keyBinding = KeyBinding.fromJwt<Header, Payload>(jwt)

        return keyBinding as ReturnKeyBindingWithHeaderAndPayload<
            Header,
            Payload,
            typeof keyBinding
        >
    }

    public async assertValidForKeyBinding() {
        try {
            this.assertHeader()
            this.assertPayload()

            if (!this.signature) {
                await this.signAndAdd()
            }

            this.assertSignature()

            this.assertClaimInHeader('typ', 'kb+jwt')
            this.assertClaimInHeader('alg')

            this.assertClaimInPayload('iat')
            this.assertClaimInPayload('nonce')
            this.assertClaimInPayload('aud')
        } catch (e) {
            if (e instanceof Error) {
                e.message = `jwt is not valid for usage with key binding. Error: ${e.message}`
            }

            throw e
        }
    }
}
