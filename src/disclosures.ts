import { Base64url } from './base64url'
import { SdJwtError } from './error'

export type DisclosureItem = [string, string, unknown] | [string, unknown]

export const encodeDisclosure = (item: DisclosureItem) =>
    Base64url.encode(JSON.stringify(item))

export const createObjectDisclosure = (
    salt: string,
    key: string,
    value: unknown
): DisclosureItem => {
    if (typeof value === 'number' && isNaN(value)) {
        throw new SdJwtError('NaN is not allowed to be used in a disclosure.')
    }

    if (typeof value === 'number' && !isFinite(value)) {
        throw new SdJwtError(
            'Infinite is not allowed to be used in a disclosure.'
        )
    }

    return [salt, key, value]
}

export const createArrayDisclosure = (
    salt: string,
    value: unknown
): DisclosureItem => {
    if (typeof value === 'number' && isNaN(value)) {
        throw new SdJwtError('NaN is not allowed to be used in a disclosure.')
    }

    if (typeof value === 'number' && !isFinite(value)) {
        throw new SdJwtError(
            'Infinite is not allowed to be used in a disclosure.'
        )
    }

    return [salt, value]
}
