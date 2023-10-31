import {
    ReturnSdJwtWithHeaderAndPayload,
    Verifier,
    sdJwtFromCompact
} from '../sdJwt'
import { SdJwt, SdJwtVerificationResult } from '../sdJwt'
import { SdJwtVcError } from './error'
import { JwtError } from '../jwt'

export type SdJwtVcVerificationResult = SdJwtVerificationResult & {
    containsExpectedKeyBinding: boolean
    containsRequiredVcProperties: boolean
}

export class SdJwtVc<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> extends SdJwt<Header, Payload> {
    private assertNonSelectivelyDisclosableClaim(claimKey: string) {
        try {
            this.assertClaimInDisclosureFrame(claimKey)
            throw new SdJwtVcError(
                `Claim key '${claimKey}' was found in the disclosure frame. This claim is not allowed to be selectively disclosed`
            )
        } catch {}
    }

    private assertNonSelectivelyDisclosableClaims() {
        if (!this.disclosureFrame) return

        this.assertNonSelectivelyDisclosableClaim('iss')
        this.assertNonSelectivelyDisclosableClaim('type')
        this.assertNonSelectivelyDisclosableClaim('iat')
        this.assertNonSelectivelyDisclosableClaim('cnf')
    }

    /**
     * @todo: this does not do any validation of the actual content of the `cnf`
     */
    private validateSdJwtVc(expectedCnfClaim?: Record<string, unknown>) {
        try {
            this.assertNonSelectivelyDisclosableClaims()
            this.assertHeader()
            this.assertPayload()

            this.assertClaimInHeader('typ', 'vc+sd-jwt')
            this.assertClaimInHeader('alg')

            this.assertClaimInPayload('iss')
            this.assertClaimInPayload('type')
            this.assertClaimInPayload('iat')
            this.assertClaimInPayload('cnf', expectedCnfClaim)
        } catch (e) {
            if (e instanceof Error) {
                e.message = `jwt is not valid for usage with sd-jwt-vc. Error: ${e.message}`
            }

            throw e
        }
    }

    public static override fromCompact<
        Header extends Record<string, unknown> = Record<string, unknown>,
        Payload extends Record<string, unknown> = Record<string, unknown>
    >(compact: string) {
        const { disclosures, keyBinding, signature, payload, header } =
            sdJwtFromCompact<Header, Payload>(compact)

        const sdJwt = new SdJwtVc<Header, Payload>({
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

    public override async verify(
        verifier: Verifier<Header>,
        requiredClaimKeys?: Array<keyof Payload | string>,
        expectedCnfClaim?: Record<string, unknown>
    ): Promise<SdJwtVcVerificationResult> {
        const publicKeyJwk = (
            this.payload?.cnf as Record<string, unknown> | undefined
        )?.jwk as Record<string, unknown> | undefined

        const sdJwtVerificationResult = (await super.verify(
            verifier,
            requiredClaimKeys,
            publicKeyJwk
        )) as SdJwtVcVerificationResult

        try {
            sdJwtVerificationResult.containsRequiredVcProperties = true
            this.validateSdJwtVc(expectedCnfClaim)

            if (expectedCnfClaim) {
                sdJwtVerificationResult.containsExpectedKeyBinding = true
            }
        } catch (e) {
            if (
                e instanceof JwtError &&
                e.message ==
                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'cnf' was found, but values did not match within the payload"
            ) {
                sdJwtVerificationResult.containsExpectedKeyBinding = false
            } else {
                sdJwtVerificationResult.containsRequiredVcProperties = false
            }
        }

        return sdJwtVerificationResult
    }

    override async toCompact(): Promise<string> {
        this.validateSdJwtVc()
        return await super.toCompact()
    }
}
