import { ClaimKeyTypeValue, assertClaimInObject } from '../util'
import { Jwt, JwtAdditionalOptions, JwtOptions } from '../jwt'
import { SignatureAndEncryptionAlgorithm } from './signatureAndEncryptionAlgorithm'

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

export class KeyBinding<
    H extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
> extends Jwt<KeyBindingHeader<H>, KeyBindingPayload<P>> {
    public constructor(
        options?: KeyBindingOptions<H, P>,
        additionalOptions?: KeyBindingAdditionalOptions
    ) {
        super(options, additionalOptions)
    }

    public static fromJwt<
        H extends Record<string, unknown> = Record<string, unknown>,
        P extends Record<string, unknown> = Record<string, unknown>
    >(jwt: Jwt) {
        const keyBinding = new KeyBinding<H, P>(
            {
                header: jwt.header as KeyBindingHeader<H>,
                payload: jwt.payload as KeyBindingPayload<P>,
                signature: jwt.signature
            },
            { signer: jwt.signer }
        )

        return keyBinding
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
