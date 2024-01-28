import { Disclosure, ReturnSdJwtWithHeaderAndPayload } from '../sdJwt'
import { SdJwt, SdJwtVerificationResult } from '../sdJwt'
import { JwtError } from '../jwt'
import { Verifier } from '../types'
import { sdJwtVcFromCompact } from '@sd-jwt/decode'
import { KeyBinding } from '../keyBinding'

export type SdJwtVcVerificationResult = SdJwtVerificationResult & {
    containsExpectedKeyBinding?: boolean
    containsRequiredVcProperties: boolean
}

export class SdJwtVc<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> extends SdJwt<Header, Payload> {
    public assertNonSelectivelyDisclosableClaims() {
        if (!this.disclosureFrame) return

        const nonSelectivelyDisclosableClaims = [
            'iss',
            'iat',
            'nbf',
            'exp',
            'cnf',
            'vct',
            'status'
        ] as const

        for (const claimKey of nonSelectivelyDisclosableClaims) {
            this.assertNonSelectivelyDisclosableClaim(claimKey)
        }
    }

    private validateSdJwtVc(expectedCnfClaim?: Record<string, unknown>) {
        try {
            this.assertNonSelectivelyDisclosableClaims()
            this.assertHeader()
            this.assertPayload()

            this.assertClaimInHeader('typ', 'vc+sd-jwt')
            this.assertClaimInHeader('alg')

            this.assertClaimInPayload('iss')
            this.assertClaimInPayload('vct')
            this.assertClaimInPayload('iat')

            if (expectedCnfClaim) {
                this.assertClaimInPayload('cnf', expectedCnfClaim)
            }
        } catch (e) {
            if (e instanceof Error) {
                e.message = `jwt is not valid for usage with sd-jwt-vc. Error: ${e.message}`
            }

            throw e
        }
    }

    /**
     *
     * Instantiate a sd-jwt-vc from a compact format.
     *
     * @throws when the compact sd-jwt-vc is not a valid sd-jwt-vc
     *
     */
    public static override fromCompact<
        Header extends Record<string, unknown> = Record<string, unknown>,
        Payload extends Record<string, unknown> = Record<string, unknown>
    >(compact: string) {
        const {
            disclosures: d,
            keyBinding: kb,
            signature,
            payload,
            header
        } = sdJwtVcFromCompact<Header, Payload>(compact)

        const disclosures = d?.map(
            (disclosure) =>
                new Disclosure(
                    disclosure.salt,
                    disclosure.value,
                    disclosure.key
                )
        )

        const keyBinding = kb
            ? new KeyBinding()
                  .withHeader(kb.header)
                  .withPayload(kb.payload)
                  .withSignature(kb.signature)
            : undefined

        const sdJwtVc = new SdJwtVc<Header, Payload>({
            header,
            payload,
            signature,
            disclosures,
            keyBinding
        })

        sdJwtVc.compact = compact

        return sdJwtVc as ReturnSdJwtWithHeaderAndPayload<
            Header,
            Payload,
            typeof sdJwtVc
        >
    }

    /**
     *
     * Verify the sd-jwt-vc.
     *
     * It validates the following properties:
     *   - sd-jwt issuer signature
     *   - Optionally, the required claims
     *   - The `nbf` and `exp` claims
     *   - Whether the key binding is valid
     *   - Whether the expected key binding is used
     *   - Whether the required sd-jwt-vc properties are included
     *
     */
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

            // The verification result is not valid if an error occurred
            sdJwtVerificationResult.isValid = false
        }

        return sdJwtVerificationResult
    }

    /**
     *
     * Create a compact format of the sd-jwt-vc.
     *
     * This will
     *   - Apply the disclosure frame
     *   - Add a signature if there is none
     *
     * @throws when the sd-jwt-vc is not conformant to the specification
     * @throws When the signature and signer are not defined
     * @throws When a claim is requested to be selectively disclosable, but it was not found in the payload
     *
     */
    override async toCompact(): Promise<string> {
        this.validateSdJwtVc()
        return await super.toCompact()
    }
}
