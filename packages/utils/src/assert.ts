import { getValueByKeyAnyLevel } from './getValueByKeyAnyLevel'
import { simpleDeepEqual } from './simpleDeepEqual'

export const assertClaimInObject = (
    object: Record<string, unknown>,
    claimKey: string,
    claimValue?: unknown
) => {
    const value = getValueByKeyAnyLevel(object, claimKey)

    if (!value) {
        throw new Error(`Claim key '${claimKey}' not found in any level`)
    }

    if (claimValue && !simpleDeepEqual(value, claimValue)) {
        throw new Error(
            `Claim key '${claimKey}' was found, but values did not match`
        )
    }
}
