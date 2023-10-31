import { Base64url } from '../base64url'
import { SdJwtError } from './error'
import { SaltGenerator } from './decoys'
import { HasherAndAlgorithm } from './hasher'
import {
    Jwt,
    JwtAdditionalOptions,
    JwtVerificationResult,
    Signer
} from '../jwt/jwt'
import { KeyBinding } from '../keyBinding'
import {
    ReturnSdJwtWithHeaderAndPayload,
    ReturnSdJwtWithKeyBinding,
    ReturnSdJwtWithPayload,
    Verifier
} from './types'
import { sdJwtFromCompact } from './compact'
import { Disclosure } from './disclosures'
import { DisclosureFrame, applyDisclosureFrame } from './disclosureFrame'
import { swapClaims } from './swapClaim'
import { getAllKeys, getValueByKeyAnyLevel } from '../utils'
import { HasherAlgorithm } from './hasherAlgorithm'

export type SdJwtToCompactOptions<
    DisclosablePayload extends Record<string, unknown>
> = {
    disclosureFrame?: DisclosureFrame<DisclosablePayload>
    shouldApplyFrame?: boolean
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

export type SdJwtVerificationResult = JwtVerificationResult & {
    isKeyBindingValid?: boolean
}

export class SdJwt<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> extends Jwt<Header, Payload> {
    public disclosures?: Array<Disclosure>
    public keyBinding?: KeyBinding

    private saltGenerator?: SaltGenerator
    private hasherAndAlgorithm?: HasherAndAlgorithm
    public disclosureFrame?: DisclosureFrame<Payload>

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

        return sdJwt as ReturnSdJwtWithHeaderAndPayload<
            Header,
            Payload,
            typeof sdJwt
        >
    }

    public withSaltGenerator(saltGenerator: SaltGenerator) {
        this.saltGenerator = saltGenerator
        return this
    }

    public withSigner(signer: Signer<Header>) {
        this.signer = signer as Signer<Record<string, unknown>>
        return this
    }

    public withHasher(hasherAndAlgorithm: HasherAndAlgorithm) {
        this.hasherAndAlgorithm = hasherAndAlgorithm

        return this as ReturnSdJwtWithPayload<Header, Payload, this>
    }

    private addHasherAlgorithmToPayload() {
        this.assertHashAndAlgorithm()

        this.addPayloadClaim('_sd_alg', this.hasherAndAlgorithm!.algorithm)

        return this as ReturnSdJwtWithPayload<Header, Payload, this>
    }

    public withKeyBinding(
        keyBinding: Jwt | KeyBinding | string
    ): ReturnSdJwtWithKeyBinding<Header, Payload, this> {
        const kb =
            typeof keyBinding === 'string'
                ? KeyBinding.fromCompact(keyBinding)
                : keyBinding instanceof KeyBinding
                ? keyBinding
                : KeyBinding.fromJwt(keyBinding)

        this.keyBinding = kb
        return this as ReturnSdJwtWithKeyBinding<Header, Payload, this>
    }

    public withDisclosureFrame(disclosureFrame: DisclosureFrame<Payload>) {
        this.disclosureFrame = disclosureFrame
        return this
    }

    public async applyDisclosureFrame() {
        this.assertSaltGenerator()
        this.assertHashAndAlgorithm()
        this.assertPayload()

        if (!this.disclosureFrame) {
            throw new SdJwtError(
                'To apply a disclosure frame, either inlude one in the API, supply it via the constructor or call `this.withDisclosureFrame()`.'
            )
        }

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

        const { payload: framedPayload, disclosures } =
            await applyDisclosureFrame(
                this.saltGenerator!,
                this.hasherAndAlgorithm!.hasher,
                this.addHasherAlgorithmToPayload().payload!,
                this.disclosureFrame
            )

        this.disclosures = disclosures
        this.payload = framedPayload as Payload
    }

    public assertDisclosureFrame() {
        if (this.disclosureFrame) return

        throw new SdJwtError('Disclosureframe must be defined')
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

    public assertClaimInDisclosureFrame(claimKey: string) {
        this.assertDisclosureFrame()

        const value = getValueByKeyAnyLevel(this.disclosureFrame!, claimKey)

        if (!value) {
            throw new SdJwtError(
                `Claim key '${claimKey}' not found in any level of the disclosureFrame`
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

    /**
     * @todo: using the indices of the disclosures that should be added is not the best API.
     *
     * Either support for PEX should be added and we can just take a `PresentationDefinition`, but for now this is the best we can do.
     *
     * This function includes disclosures optimisitcally. This means that is `undefined` is supplied, it includes all disclosures. To include nothing, supply an empty array.
     */
    public async present(includedDisclosureIndices?: Array<number>) {
        if (!this.disclosures && this.disclosureFrame) {
            await this.applyDisclosureFrame()
        }

        if (
            includedDisclosureIndices &&
            includedDisclosureIndices.length > 0 &&
            !this.disclosures
        ) {
            throw new SdJwtError(
                'Cannot create a presentation with disclosures while no disclosures are on the sd-jwt'
            )
        }

        if (
            includedDisclosureIndices &&
            includedDisclosureIndices.length > this.disclosures!.length
        ) {
            throw new SdJwtError(
                `List of included indices (${
                    includedDisclosureIndices.length
                }) is longer than the list of disclosures (${
                    this.disclosures!.length
                }).`
            )
        }

        const maxIndex = Math.max(...(includedDisclosureIndices ?? []))
        const minIndex = Math.min(...(includedDisclosureIndices ?? []))

        if (minIndex < 0) {
            throw new SdJwtError('Only positive indices are allowed')
        }

        if (
            (includedDisclosureIndices ?? []).some(
                (i) => isNaN(i) || !isFinite(i)
            )
        ) {
            throw new SdJwtError('NaN and infinity are not allowed as indices')
        }

        if (this.disclosures && maxIndex > this.disclosures.length - 1) {
            throw new SdJwtError(
                `Max index supplied was ${maxIndex}, but there are ${
                    this.disclosures!.length
                } items available. Note that it is 0-indexed`
            )
        }

        if (
            new Set(includedDisclosureIndices ?? []).size !==
            (includedDisclosureIndices ?? []).length
        ) {
            throw new SdJwtError(
                `It is not allowed to include multiple of same index`
            )
        }

        const includedDisclosures = this.disclosures
            ? includedDisclosureIndices
                ? this.disclosures.filter(
                      (_, index) => includedDisclosureIndices?.includes(index)
                  )
                : this.disclosures
            : []

        return await this.__toCompact(includedDisclosures, false)
    }

    public async verify(
        verifier: Verifier<Header>,
        requiredClaimKeys?: Array<keyof Payload | string>,
        publicKeyJwk?: Record<string, unknown>
    ): Promise<SdJwtVerificationResult> {
        this.assertSignature()

        const jwtVerificationResult = (await super.verify(
            verifier,
            requiredClaimKeys
        )) as SdJwtVerificationResult

        if (this.keyBinding) {
            const { isValid } = await this.keyBinding.verify(
                verifier as Verifier,
                [],
                publicKeyJwk
            )

            jwtVerificationResult.isKeyBindingValid = isValid
        }

        const claimKeys = getAllKeys(this.payload!).concat(
            (this.disclosures ?? []).map((d) => d.decoded[1] as string)
        )

        if (requiredClaimKeys) {
            jwtVerificationResult.areRequiredClaimsIncluded =
                requiredClaimKeys.every((key) =>
                    claimKeys.includes(key as string)
                )
        }

        return {
            ...jwtVerificationResult,
            isValid: Object.entries(jwtVerificationResult)
                .filter(
                    ([key, value]) =>
                        typeof value === 'boolean' && key !== 'isValid'
                )
                .every(([, value]) => !!value)
        }
    }

    public checkHasher(expectedHasher: HasherAlgorithm | string): boolean {
        this.assertPayload()

        try {
            this.assertClaimInPayload('_sd_alg', expectedHasher)
            return true
        } catch {
            return false
        }
    }

    public async getPrettyClaims<
        Claims extends Record<string, unknown> = Payload
    >(): Promise<Claims> {
        this.assertPayload()
        this.assertHashAndAlgorithm()

        const newPayload = await swapClaims(
            this.hasherAndAlgorithm!.hasher,
            this.payload!,
            this.disclosures ?? []
        )

        return newPayload as Claims
    }

    public async toCompact(): Promise<string> {
        return this.__toCompact()
    }

    private async __toCompact(
        disclosures: undefined | Array<Disclosure> = this.disclosures,
        shouldApplyFrame: boolean = true
    ): Promise<string> {
        this.assertHeader()
        this.assertPayload()

        await this.keyBinding?.assertValidForKeyBinding()

        if (this.disclosureFrame && shouldApplyFrame) {
            await this.applyDisclosureFrame()
        }

        disclosures ??= this.disclosures

        const compactHeader = Base64url.encode(JSON.stringify(this.header))
        const compactPayload = Base64url.encode(JSON.stringify(this.payload))

        const sSignature = this.signature
            ? Base64url.encode(this.signature)
            : Base64url.encode((await this.signAndAdd()).signature!)

        const sDisclosures =
            disclosures && disclosures.length > 0
                ? `~${disclosures.join('~')}~`
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
