import { SdJwtError } from './error'
import { Base64url } from './base64url'

export const createObjectDisclosure = (
    salt: string,
    key: string,
    value: unknown,
) => {
    if (typeof value === 'number' && isNaN(value)) {
        throw new SdJwtError('NaN is not allowed to be used in a disclosure.')
    }

    if (typeof value === 'number' && !isFinite(value)) {
        throw new SdJwtError(
            'Infinite is not allowed to be used in a disclosure.',
        )
    }

    const disclosure = [salt, key, value]

    return Base64url.encode(JSON.stringify(disclosure))
}

export const createArrayDisclosure = (salt: string, value: unknown) => {
    if (typeof value === 'number' && isNaN(value)) {
        throw new SdJwtError('NaN is not allowed to be used in a disclosure.')
    }

    if (typeof value === 'number' && !isFinite(value)) {
        throw new SdJwtError(
            'Infinite is not allowed to be used in a disclosure.',
        )
    }

    const disclosure = [salt, value]

    return Base64url.encode(JSON.stringify(disclosure))
}
