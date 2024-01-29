import { disclosureCalculateDigest } from '@sd-jwt/decode'
import {
    AsyncHasher,
    Hasher,
    HasherAlgorithm,
    HasherAndAlgorithm
} from '@sd-jwt/types'
import { Base64url, isPromise } from '@sd-jwt/utils'
import { DisclosureItem } from '../types'
import { SdJwtError } from './error'
import {
    DisclosureWithDigest as DisclosureWithDigestJson,
    Disclosure as DisclosureJson
} from '@sd-jwt/types'

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

    public withCalculateDigest<
        HasherImplementation extends Hasher | AsyncHasher
    >(
        hasherAndAlgorithm: HasherAndAlgorithm<HasherImplementation>,
        // Whether to recalculate the digest, even if it is already set
        { recalculate = false }: { recalculate?: boolean } = {}
    ): WithCalculateDigestReturnType<HasherImplementation> {
        // NOTE: the implementation of this method seems overly complex, but it allows
        // us to return a promise if the hasher returns a promise, and a value otherwise.
        // This allows this method to be used in environments where the calling scope
        // is not async, as long as the hasher is not async either.
        if (!recalculate && isDisclosureWithDigest(this)) {
            return this as unknown as WithCalculateDigestReturnType<HasherImplementation>
        }

        const digestResult = disclosureCalculateDigest(
            this.asJson(),
            // TODO: string vs HasherAlgorithm
            hasherAndAlgorithm.algorithm as HasherAlgorithm,
            hasherAndAlgorithm.hasher
        )

        if (isPromise(digestResult)) {
            return digestResult.then((digest) => {
                this.#digest = digest

                // We know for sure that digest is defined now
                return this
            }) as unknown as WithCalculateDigestReturnType<HasherImplementation>
        } else {
            this.#digest = digestResult

            // We know for sure that digest is defined now
            return this as unknown as WithCalculateDigestReturnType<HasherImplementation>
        }
    }

    public toString() {
        return this.encoded
    }

    public asJson() {
        return {
            encoded: this.encoded,
            salt: this.salt,
            value: this.value,
            key: this.key,
            digest: this.digest
        } as this extends DisclosureWithDigest
            ? DisclosureWithDigestJson
            : DisclosureJson
    }

    public static fromJson<D extends DisclosureJson | DisclosureWithDigestJson>(
        disclosureJson: D
    ) {
        const disclosure = new Disclosure(
            disclosureJson.salt,
            disclosureJson.value,
            disclosureJson.key
        )

        if ('digest' in disclosureJson) {
            disclosure.withDigest(disclosureJson.digest)
        }

        return disclosure as D extends DisclosureWithDigestJson
            ? DisclosureWithDigest
            : Disclosure
    }
}

export type WithCalculateDigestReturnType<
    HasherImplementation extends Hasher | AsyncHasher
> = ReturnType<HasherImplementation> extends Promise<any>
    ? Promise<DisclosureWithDigest>
    : DisclosureWithDigest

export function isDisclosureWithDigest(
    disclosure: Disclosure
): disclosure is DisclosureWithDigest {
    return disclosure.digest !== undefined
}
