import { Disclosure, DisclosureArray } from '@sd-jwt/types'

export const disclosureFromArray = (
    a: DisclosureArray
): Omit<Disclosure, 'encoded'> =>
    a[2]
        ? { salt: a[0], key: a[1] as string, value: a[2] }
        : { salt: a[0], value: a[1] }
