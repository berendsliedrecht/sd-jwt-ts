import { Base64url } from '../base64url'
import { SdJwtError } from './error'
import {
    DisclosureFrame,
    HasherAndAlgorithm,
    SaltGenerator,
    Verifier
} from '../types'
import { Jwt, JwtAdditionalOptions, JwtVerificationResult } from '../jwt/jwt'
import { KeyBinding } from '../keyBinding'
import {
    ReturnSdJwtWithHeaderAndPayload,
    ReturnSdJwtWithKeyBinding,
    ReturnSdJwtWithPayload
} from './types'
import { sdJwtFromCompact } from './compact'
import { Disclosure } from './disclosures'
import { applyDisclosureFrame } from './disclosureFrame'
import { swapClaims } from './swapClaim'
import { getAllKeys, getValueByKeyAnyLevel } from '../utils'
import { HasherAlgorithm } from '../hasherAlgorithm'

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

    /**
     *
     * Create an sd-jwt from a compact format. This will succeed for a normal jwt as well.
     *
     */
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

    /**
     *
     * Add a salt generator.
     *
     * Recommended size is 128 bits (i.e. 16 bytes).
     *
     * Salts will not be seeded and a new one will be used for each claim.
     *
     * @example
     *
     * Node.js: `crypto.randomBytes(128 / 8)`
     *
     * React Native: `expo-standard-web-crypto`
     *
     * Browser: `crypto.getRandomValues(new Uint8Array(128 / 8))`
     *
     */
    public withSaltGenerator(saltGenerator: SaltGenerator) {
        this.saltGenerator = saltGenerator
        return this
    }

    /**
     *
     * Add a hasher that will be used to hash the disclosures.
     *
     * @note Make sure to return a base64url encoded version of the hash.
     *
     * @example
     *
     * Node.js: `createHash('sha256').update(input).digest().toString('base64url')`
     *
     */
    public withHasher(hasherAndAlgorithm: HasherAndAlgorithm) {
        this.hasherAndAlgorithm = hasherAndAlgorithm

        return this as ReturnSdJwtWithPayload<Header, Payload, this>
    }

    /**
     *
     * Adds the algorithm of the hasher to the payload.
     *
     * For convience, this also allows you to set the hasher.
     *
     * @throws when the hasher and algorithm are not set.
     *
     */
    public addHasherAlgorithmToPayload(
        hasherAndAlgorithm?: HasherAndAlgorithm
    ) {
        if (hasherAndAlgorithm) this.withHasher(hasherAndAlgorithm)
        this.assertHashAndAlgorithm()

        this.addPayloadClaim('_sd_alg', this.hasherAndAlgorithm!.algorithm)

        return this as ReturnSdJwtWithPayload<Header, Payload, this>
    }

    /**
     *
     * Set the `KeyBinding` jwt.
     *
     * This can be done as a holder to provide proof of possession of key material
     *
     */
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

    /**
     *
     * Set the disclosure frame which will be applied via `SdJwt.applyDisclosureFrame` or when `SdJwt.toCompact` is called.
     *
     */
    public withDisclosureFrame(disclosureFrame: DisclosureFrame<Payload>) {
        this.disclosureFrame = disclosureFrame
        return this
    }

    /**
     *
     * Apply the disclosure frame.
     *
     * @throws when the salt generator is not set
     * @throws when the hasher and algorithm is not set
     * @throws when the payload is not set
     * @throws when no disclosure frame is set
     * @throws when disclosures are included and a signature is set, but no signer is provided `*`
     * @throws when the disclosure frame is inconsistent with the payload
     *
     * * This is done as removing items from the payload alters the signature and it has to be resigned.
     *
     */
    public async applyDisclosureFrame() {
        this.assertSaltGenerator()
        this.assertHashAndAlgorithm()
        this.assertPayload()
        this.assertDisclosureFrame()

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
                this.disclosureFrame!
            )

        this.disclosures = disclosures
        this.payload = framedPayload as Payload
    }

    /**
     *
     * Assert that the disclosure frame is set.
     *
     */
    public assertDisclosureFrame() {
        if (this.disclosureFrame) return

        throw new SdJwtError('Disclosureframe must be defined')
    }

    /**
     *
     * Assert that the salt generator is set.
     *
     */
    private assertSaltGenerator() {
        if (!this.saltGenerator) {
            throw new SdJwtError(
                'Cannot create a disclosure without a salt generator. You can set it with this.withSaltGenerator()'
            )
        }
    }

    /**
     *
     * Assert that the hasher and algorithm is set.
     *
     */
    private assertHashAndAlgorithm() {
        if (!this.hasherAndAlgorithm) {
            throw new SdJwtError(
                'A hasher and algorithm must be set in order to create a digest of a disclosure. You can set it with this.withHasherAndAlgorithm()'
            )
        }
    }

    /**
     *
     * Assert that a certain claim is included in the disclosure frame.
     *
     * @throws when the disclosure frame is not set
     *
     */
    public assertClaimInDisclosureFrame(claimKey: string) {
        this.assertDisclosureFrame()

        const value = getValueByKeyAnyLevel(this.disclosureFrame!, claimKey)

        if (!value) {
            throw new SdJwtError(
                `Claim key '${claimKey}' not found in any level of the disclosureFrame`
            )
        }
    }

    /**
     * @todo: using the indices of the disclosures that should be added is not the best API.
     *
     * Either support for PEX should be added and we can just take a `PresentationDefinition`, but for now this is the best we can do.
     *
     * This function includes disclosures optimisitcally. This means that is `undefined` is supplied, it includes all disclosures. To include nothing, supply an empty array.
     *
     * @throws when indices are supplied, but there are no disclosures on the instance
     * @throws when the indices list is larger than the disclosure list
     * @throws when a negative index is provided
     * @throws when `NaN` or `Infinity` is supplied
     * @throws when an index larger than the `disclosures.length - 1` is provided
     * @throws when the same index is included multiple times
     *
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

    /**
     *
     * Verify the sd-jwt.
     *
     * It validates the following properties:
     *   - sd-jwt issuer signature
     *   - Optionally, the required claims
     *   - The `nbf` and `exp` claims
     *   - Whether the key binding is valid
     *
     */
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

    /**
     *
     * Utility method to check whether the expected hasher algorithm is used.
     *
     */
    public checkHasher(expectedHasher: HasherAlgorithm | string): boolean {
        try {
            this.assertPayload()
            this.assertClaimInPayload('_sd_alg', expectedHasher.toString())
            return true
        } catch (e) {
            console.error(e)
            return false
        }
    }

    public assertNonSelectivelyDisclosableClaim(claimKey: string) {
        try {
            this.assertClaimInDisclosureFrame(claimKey)
        } catch {
            return
        }
        throw new SdJwtError(
            `Claim key '${claimKey}' was found in the disclosure frame. This claim is not allowed to be selectively disclosed`
        )
    }

    public assertNonSelectivelyDisclosableClaims() {
        if (!this.disclosureFrame) return
        ;['_sd', '_sd_alg', '...'].forEach(
            this.assertNonSelectivelyDisclosableClaim
        )
    }

    /**
     *
     * Return all claims from the payload and the disclosures on their original place.
     *
     */
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

    /**
     *
     * Create a compact format of the sd-jwt.
     *
     * This will
     *   - Apply the disclosure frame
     *   - Add a signature if there is none
     *
     * @throws When the signature and signer are not defined
     * @throws When a claim is requested to be selectively disclosable, but it was not found in the payload
     *
     */
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
