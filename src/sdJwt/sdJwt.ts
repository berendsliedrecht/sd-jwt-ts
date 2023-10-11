import { Base64url } from '../base64url'
import { SdJwtError } from './error'
import { SaltGenerator } from './decoys'
import { HasherAndAlgorithm } from './hashDisclosure'
import { Jwt, JwtAdditionalOptions } from '../jwt/jwt'
import { KeyBinding } from '../keyBinding'
import {
    ReturnSdJwtWithHeaderAndPayload,
    ReturnSdJwtWithKeyBinding,
    ReturnSdJwtWithPayload,
    Signer,
    Verifier
} from './types'
import { sdJwtFromCompact } from './compact'
import { Disclosure } from './disclosures'
import { DisclosureFrame, applyDisclosureFrame } from './disclosureFrame'

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

    keyBinding?: KeyBinding

    disclosures?: Array<Disclosure>
}

export type SdJwtAdditionalOptions<Payload extends Record<string, unknown>> =
    JwtAdditionalOptions & {
        hasherAndAlgorithm?: HasherAndAlgorithm
        saltGenerator?: SaltGenerator
        disclosureFrame?: DisclosureFrame<Payload>
    }

export class SdJwt<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> extends Jwt<Header, Payload> {
    public disclosures?: Array<Disclosure>
    public keyBinding?: KeyBinding

    private saltGenerator?: SaltGenerator
    private hasherAndAlgorithm?: HasherAndAlgorithm
    private disclosureFrame?: DisclosureFrame<Payload>

    public constructor(
        options?: SdJwtOptions<Header, Payload>,
        additionalOptions?: SdJwtAdditionalOptions<Payload>
    ) {
        super(options, additionalOptions)
        this.header = options?.header
        this.payload = options?.payload
        this.signature = options?.signature
        this.disclosures = options?.disclosures
        this.keyBinding = options?.keyBinding

        if (additionalOptions?.hasherAndAlgorithm) {
            this.withHasher(additionalOptions.hasherAndAlgorithm)
        }

        if (additionalOptions?.saltGenerator) {
            this.withSaltGenerator(additionalOptions.saltGenerator)
        }

        if (additionalOptions?.disclosureFrame) {
            this.withDisclosureFrame(additionalOptions.disclosureFrame)
        }

        if (additionalOptions?.signer) {
            this.withSigner(additionalOptions.signer)
        }
    }

    public static override fromCompact<
        Header extends Record<string, unknown> = Record<string, unknown>,
        Payload extends Record<string, unknown> = Record<string, unknown>
    >(compact: string) {
        const { disclosures, keyBinding, signature, payload, header } =
            sdJwtFromCompact<Header, Payload>(compact)

        const sdJwt = new SdJwt<Header, Payload>({
            header,
            payload,
            signature,
            disclosures,
            keyBinding
        })

        return sdJwt as ReturnSdJwtWithHeaderAndPayload<typeof sdJwt>
    }

    public withSaltGenerator(saltGenerator: SaltGenerator) {
        this.saltGenerator = saltGenerator
        return this
    }

    public withSigner(signer: Signer<Header>) {
        this.signer = signer as Signer<Record<string, unknown>>
        return this
    }

    public withHasher(
        hasherAndAlgorithm: HasherAndAlgorithm
    ): ReturnSdJwtWithPayload<this> {
        this.hasherAndAlgorithm = hasherAndAlgorithm

        this.addHasherAlgorithmToPayload()

        return this as ReturnSdJwtWithPayload<this>
    }

    private addHasherAlgorithmToPayload(): ReturnSdJwtWithPayload<this> {
        this.assertHashAndAlgorithm()

        this.addPayloadClaim('_sd_alg', this.hasherAndAlgorithm!.algorithm)

        return this as ReturnSdJwtWithPayload<this>
    }

    public withKeyBinding(
        keyBinding: Jwt | KeyBinding | string
    ): ReturnSdJwtWithKeyBinding<this> {
        const kb =
            typeof keyBinding === 'string'
                ? KeyBinding.fromCompact(keyBinding)
                : KeyBinding.fromJwt(keyBinding)

        this.keyBinding = kb
        return this as ReturnSdJwtWithKeyBinding<this>
    }

    public withDisclosureFrame(disclosureFrame: DisclosureFrame<Payload>) {
        this.disclosureFrame = disclosureFrame
        return this
    }

    public async applyDisclosureFrame() {
        this.assertSaltGenerator()
        this.assertHashAndAlgorithm()
        this.assertPayload()
        this.assertDisclosureFrame()

        const { payload: framedPayload, disclosures } =
            await applyDisclosureFrame(
                this.saltGenerator!,
                this.hasherAndAlgorithm!.hasher,
                this.payload!,
                this.disclosureFrame!
            )

        this.disclosures = disclosures
        this.payload = framedPayload as Payload
    }

    private assertSaltGenerator() {
        if (!this.saltGenerator) {
            throw new SdJwtError(
                'Cannot create a disclosure without a salt generator. You can set it with this.withSaltGenerator()'
            )
        }
    }

    private assertDisclosureFrame() {
        if (!this.disclosureFrame) {
            throw new SdJwtError(
                'Cannot apply disclosure frame when the disclosure frame is not defined. You can set it with this.withDisclosureFrame()'
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

    public async verifySignature(cb: Verifier<Header>): Promise<boolean> {
        this.assertSignature()
        const message = this.signableInput

        return await cb({
            message,
            header: this.header as Header,
            signature: this.signature!
        })
    }

    public async toCompact(
        options?: SdJwtToCompactOptions<Payload>
    ): Promise<string> {
        this.assertHeader()
        this.assertPayload()

        await this.keyBinding?.assertValidForKeyBinding()

        const frame = options?.disclosureFrame ?? this.disclosureFrame
        const shouldApplyFrame = !!frame

        if (shouldApplyFrame) {
            if (
                this.disclosures &&
                this.disclosures.length > 0 &&
                this.signature &&
                !this.signer
            ) {
                throw new SdJwtError(
                    'Signature is already set by the user when selectively disclosable items still have to be removed. This will invalidate the signature. Try to provide a signer on SdJwt.withSigner and SdJwt.toCompact will call it at the correct time.'
                )
            }

            this.addHasherAlgorithmToPayload()
        }

        if (shouldApplyFrame) await this.applyDisclosureFrame()

        const compactHeader = Base64url.encode(JSON.stringify(this.header))
        const compactPayload = Base64url.encode(JSON.stringify(this.payload))

        const sSignature = this.signature
            ? Base64url.encode(this.signature)
            : Base64url.encode((await this.signAndAdd()).signature!)

        const sDisclosures =
            this.disclosures && this.disclosures.length > 0
                ? `~${this.disclosures?.join('~')}~`
                : ''

        const kb = await this.keyBinding?.toCompact()

        const sKeyBinding = this.keyBinding
            ? sDisclosures.length > 0
                ? kb
                : `~${kb}`
            : ''

        return `${compactHeader}.${compactPayload}.${sSignature}${sDisclosures}${sKeyBinding}`
    }
}
