import type { AsyncHasher, DisclosureWithDigest, Hasher } from '@sd-jwt/types'

import { HasherAlgorithm } from '@sd-jwt/utils'
import { sdJwtVcFromCompact } from './fromCompact'
import { getValueByKeyAnyLevel, swapClaims } from '@sd-jwt/utils'
import { disclosureCalculateDigest } from '../disclosures/calculateDigest'
import { disclosureToArray } from '../disclosures/toArray'

export const decodeSdJwtVc = <HI extends Hasher | AsyncHasher>(
    compact: string,
    hasher: HI
) => {
    const { header, payload, signature, keyBinding, disclosures } =
        sdJwtVcFromCompact(compact)

    const hasherAlgorithm =
        getValueByKeyAnyLevel<HasherAlgorithm>(payload, '_sd_alg') ??
        HasherAlgorithm.Sha256

    const disclosureWithDigests =
        disclosures?.map((d) => ({
            digest: disclosureCalculateDigest(d, hasherAlgorithm, hasher),
            decoded: d,
            encoded: disclosureToArray(d)
        })) ?? []

    return {
        compactSdJwtVc: compact,
        signedPayload: payload,
        header,
        signature,
        keyBinding,
        disclosures: disclosureWithDigests,
        decodedPayload: swapClaims(
            payload,
            disclosureWithDigests.map((d) => ({
                ...d.decoded,
                digest: d.digest
            })) as unknown as Array<DisclosureWithDigest>
        )
    }
}
