import { Disclosure, DisclosureArray } from '@sd-jwt/types'

export const disclosureToArray = (d: Disclosure): DisclosureArray =>
    d.key ? [d.salt, d.key, d.value] : [d.salt, d.value]
