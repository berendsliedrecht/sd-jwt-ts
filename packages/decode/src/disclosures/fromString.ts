import type { Disclosure, DisclosureArray } from '@sd-jwt/types'
import { Base64url } from '@sd-jwt/utils'
import { disclosureFromArray } from './fromArray'

export const disclosureFromString = (s: string): Disclosure => {
    const item = Base64url.decodeToJson<DisclosureArray>(s)
    return { ...disclosureFromArray(item), encoded: s }
}
