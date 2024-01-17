import type { AsyncHasher, DisclosureWithDigest, Hasher } from '@sd-jwt/types'
import { isPromise } from '@sd-jwt/utils'
import { HasherAlgorithm } from '@sd-jwt/utils'
import { sdJwtVcFromCompact } from './fromCompact'
import { getValueByKeyAnyLevel } from '@sd-jwt/utils'
import { disclosureCalculateDigest } from '../disclosures/calculateDigest'
import { decodeDisclosuresInPayload } from '../disclosures'

interface DecodeSdJwtVcResult {
    compactSdJwtVc: string
    signedPayload: Record<string, unknown>
    header: Record<string, unknown>
    signature: Uint8Array
    keyBinding?: Record<string, unknown>
    disclosures: Array<DisclosureWithDigest>
    decodedPayload: Record<string, unknown>
}

export const decodeSdJwtVc = <HI extends Hasher | AsyncHasher>(
    compact: string,
    hasher: HI
): HI extends AsyncHasher
    ? Promise<DecodeSdJwtVcResult>
    : DecodeSdJwtVcResult => {
    const { header, payload, signature, keyBinding, disclosures } =
        sdJwtVcFromCompact(compact)

    const hasherAlgorithm =
        getValueByKeyAnyLevel<HasherAlgorithm>(payload, '_sd_alg') ??
        HasherAlgorithm.Sha256

    const disclosuresWithDigestsResult = (disclosures?.map((disclosure) => {
        const digestResult = disclosureCalculateDigest(
            disclosure,
            hasherAlgorithm,
            hasher
        )

        return isPromise(digestResult)
            ? digestResult.then((digest) => ({ ...disclosure, digest }))
            : { ...disclosure, digest: digestResult }
    }) ?? []) as
        | Array<DisclosureWithDigest>
        | Array<Promise<DisclosureWithDigest>>

    const basePayload = {
        compactSdJwtVc: compact,
        signedPayload: payload,
        header,
        signature,
        keyBinding
    } as const

    if (isAsyncCalculateDigestReturnType(disclosuresWithDigestsResult)) {
        return Promise.all(disclosuresWithDigestsResult).then(
            (disclosureWithDigests) => ({
                ...basePayload,
                disclosures: disclosureWithDigests,
                decodedPayload: decodeDisclosuresInPayload(
                    basePayload.signedPayload,
                    disclosureWithDigests
                )
            })
        ) as HI extends AsyncHasher
            ? Promise<DecodeSdJwtVcResult>
            : DecodeSdJwtVcResult
    } else {
        return {
            ...basePayload,
            disclosures: disclosuresWithDigestsResult,
            decodedPayload: decodeDisclosuresInPayload(
                basePayload.signedPayload,
                disclosuresWithDigestsResult
            )
        } as HI extends AsyncHasher
            ? Promise<DecodeSdJwtVcResult>
            : DecodeSdJwtVcResult
    }
}

function isAsyncCalculateDigestReturnType(
    disclosureWithDigests: Array<
        Promise<DisclosureWithDigest> | DisclosureWithDigest
    >
): disclosureWithDigests is Array<Promise<DisclosureWithDigest>> {
    return isPromise(disclosureWithDigests[0])
}
