import {
    ReturnSdJwtWithHeaderAndPayload,
    Verifier,
    sdJwtFromCompact
} from '../sdJwt'
import { SdJwt, SdJwtVerificationResult } from '../sdJwt'
import { SdJwtVcError } from './error'
import { ClaimKeyTypeValue, assertClaimInObject } from '../utils'

export type SdJwtVcVerificationResult = SdJwtVerificationResult

export class SdJwtVc<
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
> extends SdJwt<Header, Payload> {
    private assertNonSelectivelyDisclosableItems() {
        if (!this.disclosureFrame) return

        const disallowedSelectivelyDisclosedClaims = [
            'iss',
            'type',
            'iat',
            'cnf'
        ]
        const requiredPayloadProperties: Array<ClaimKeyTypeValue> =
            disallowedSelectivelyDisclosedClaims.map((d) => [d])

        try {
            assertClaimInObject(
                this.disclosureFrame!,
                requiredPayloadProperties
            )

            throw new SdJwtVcError(
                `One of the following claims was attempted to be selectively disclosed while this is not allowed. '${disallowedSelectivelyDisclosedClaims.join(
                    ', '
                )}'`
            )
        } catch {
            return
        }
    }

    /**
     * @todo: this does not do any validation of the actual content of the `cnf`
     */
    private validateSdJwtVc() {
        try {
            this.assertNonSelectivelyDisclosableItems()
            this.assertHeader()
            this.assertPayload()

            const requiredHeaderProperties: Array<ClaimKeyTypeValue> = [
                ['typ', 'vc+sd-jwt'],
                ['alg']
            ]

            assertClaimInObject(this.header!, requiredHeaderProperties)

            const requiredPayloadProperties: Array<ClaimKeyTypeValue> = [
                ['iss'],
                ['type'],
                ['iat'],
                ['cnf']
            ]

            assertClaimInObject(this.payload!, requiredPayloadProperties)
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

        return sdJwt as ReturnSdJwtWithHeaderAndPayload<typeof sdJwt>
    }

    public override async verify(
        verifier: Verifier<Header>,
        requiredClaimKeys?: Array<keyof Payload | string>
    ): Promise<SdJwtVcVerificationResult> {
        const publicKeyJwk = (
            this.payload?.cnf as Record<string, unknown> | undefined
        )?.jwk as Record<string, unknown> | undefined

        const sdJwtVerificationResult = await super.verify(
            verifier,
            requiredClaimKeys,
            publicKeyJwk
        )

        return sdJwtVerificationResult
    }

    override async toCompact(): Promise<string> {
        this.validateSdJwtVc()
        return await super.toCompact()
    }
}
