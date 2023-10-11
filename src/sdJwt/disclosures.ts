import { Base64url } from '../base64url'
import { SdJwtError } from './error'

export type DisclosureItem = [string, string, unknown] | [string, unknown]

export class Disclosure {
    private salt: string
    private key?: string
    private value: unknown

    public constructor(salt: string, value: unknown, key?: string) {
        if (typeof value === 'number' && isNaN(value)) {
            throw new SdJwtError(
                'NaN is not allowed to be used in a disclosure.'
            )
        }

        if (typeof value === 'number' && !isFinite(value)) {
            throw new SdJwtError(
                'Infinite is not allowed to be used in a disclosure.'
            )
        }

        this.salt = salt
        this.key = key
        this.value = value
    }

    public static fromString(s: string) {
        const item = Base64url.decodeToJson<DisclosureItem>(s)

        return item[2]
            ? new Disclosure(item[0], item[2], item[1] as string)
            : new Disclosure(item[0], item[1])
    }

    public get encoded() {
        return Base64url.encodeFromJson(this.decoded)
    }

    public get decoded(): DisclosureItem {
        return this.key
            ? [this.salt, this.key, this.value]
            : [this.salt, this.value]
    }

    public toString() {
        return this.encoded
    }
}
