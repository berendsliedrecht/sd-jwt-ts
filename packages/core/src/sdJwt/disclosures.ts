import { DisclosureItem, Hasher } from '../types'
import { Base64url } from '../base64url'
import { SdJwtError } from './error'

// Make the digest property required
export type DisclosureWithDigest = Disclosure & { digest: string }

export class Disclosure {
    private salt: string
    private key?: string
    private value: unknown
    #digest?: string

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

        return Disclosure.fromArray(item)
    }

    public static fromArray(item: DisclosureItem) {
        return item[2] === undefined
            ? new Disclosure(item[0], item[1])
            : new Disclosure(item[0], item[2], item[1] as string)
    }

    public get encoded() {
        return Base64url.encodeFromJson(this.decoded)
    }

    public get decoded(): DisclosureItem {
        return this.key
            ? [this.salt, this.key, this.value]
            : [this.salt, this.value]
    }

    public get digest() {
        return this.#digest
    }

    /**
     * Set the digest of the disclosure.
     *
     * NOTE: this method statically sets the digest, and does not verify whether the digest is correct.
     * If you want to calculate the digest, use the `withCalculateDigest` method instead.
     */
    public withDigest(digest: string): DisclosureWithDigest {
        this.#digest = digest
        return this as DisclosureWithDigest
    }

    public async withCalculateDigest(
        hasher: Hasher,
        // Whether to recalculate the digest, even if it is already set
        { recalculate = false }: { recalculate?: boolean } = {}
    ): Promise<DisclosureWithDigest> {
        if (!recalculate && isDisclosureWithDigest(this)) return this

        // Calculate digest
        const hash = await hasher(this.encoded)
        this.#digest = Base64url.encode(hash)

        // We know for sure that digest is defined now
        return this as DisclosureWithDigest
    }

    public toString() {
        return this.encoded
    }
}

export function isDisclosureWithDigest(
    disclosure: Disclosure
): disclosure is DisclosureWithDigest {
    return disclosure.digest !== undefined
}
