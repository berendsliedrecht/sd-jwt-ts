import { keyBindingFromCompact } from '@sd-jwt/decode'
import {
    Jwt,
    JwtAdditionalOptions,
    JwtOptions,
    JwtVerificationResult
} from '../jwt'
import { SignatureAndEncryptionAlgorithm } from '../signatureAndEncryptionAlgorithm'
import { MakePropertyRequired, Signer, Verifier } from '../types'

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
> = JwtOptions<KeyBindingHeader<Header>, KeyBindingPayload<Payload>> & {
    /**
     * The compact SD-JWT over which the key binding should provide integrity
     */
    compactSdJwt?: string
}

export type KeyBindingAdditionalOptions<
    Header extends Record<string, unknown> = Record<string, unknown>
> = JwtAdditionalOptions<KeyBindingHeader<Header>>

export type KeyBindingVerificationResult = JwtVerificationResult

export class KeyBinding<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> extends Jwt<Header, Payload> {
    public override signer?: Signer<Header>

    public expectedSdHash?: string

    public constructor(
        options?: KeyBindingOptions<Header, Payload>,
        additionalOptions?: KeyBindingAdditionalOptions<Header>
    ) {
        super(options)

        this.signer = additionalOptions?.signer as Signer<Header>
    }

    /**
     *
     * Convert a standard `JWT` to an instance of `KeyBinding`.
     *
     * @throws when the claims are not valid for key binding
     *
     */
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

        keyBinding.assertValidForKeyBinding()

        return keyBinding
    }

    /**
     *
     * Verify the jwt as a valid `KeyBinding` jwt.
     *
     * Invalid when:
     *   - The required claims for key binding are not included
     *   - The signature is invalid
     *   - The optional required additional claims are not included
     *
     */
    public override async verify(
        verifySignature: Verifier<Header>,
        requiredClaims?: Array<keyof Payload | string>,
        publicKeyJwk?: Record<string, unknown>
    ): Promise<KeyBindingVerificationResult> {
        if (!this.expectedSdHash) {
            throw new Error(
                'Expected sd hash is required for verification of key binding JWT'
            )
        }

        // TODO: should _sd_hash also be a verification property (true/false)
        // or should it throw?
        await this.assertValidForKeyBinding(this.expectedSdHash)

        const jwtVerificationResult = await super.verify(
            verifySignature,
            requiredClaims,
            publicKeyJwk
        )

        return jwtVerificationResult
    }

    /**
     *
     * Convert a compact `JWT` into an instance of `KeyBinding`.
     *
     * @throws when the claims are not valid for key binding
     *
     */
    public static override fromCompact<
        Header extends Record<string, unknown> = Record<string, unknown>,
        Payload extends Record<string, unknown> = Record<string, unknown>
    >(compact: string) {
        const { header, payload, signature } = keyBindingFromCompact<
            KeyBindingHeader<Header>,
            KeyBindingPayload<Payload>
        >(compact)

        const keyBinding = new KeyBinding({ header, payload, signature })

        return keyBinding as ReturnKeyBindingWithHeaderAndPayload<
            Header,
            Payload,
            typeof keyBinding
        >
    }

    public withSdHash(sdHash: string) {
        this.addPayloadClaim('_sd_hash', sdHash)

        return this
    }

    public withExpectedSdHash(expectedSdHash: string) {
        this.expectedSdHash = expectedSdHash

        return this
    }

    /**
     *
     * Asserts the required properties for valid key binding.
     *
     * @throws when a claim in the header, or payload, is invalid
     *
     */
    public async assertValidForKeyBinding(expectedSdHash?: string) {
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

            if (expectedSdHash ?? this.expectedSdHash) {
                this.assertClaimInPayload(
                    '_sd_hash',
                    expectedSdHash ?? this.expectedSdHash
                )
            } else {
                this.assertClaimInPayload('_sd_hash')
            }
        } catch (e) {
            if (e instanceof Error) {
                e.message = `jwt is not valid for usage with key binding. Error: ${e.message}`
            }

            throw e
        }
    }
}
