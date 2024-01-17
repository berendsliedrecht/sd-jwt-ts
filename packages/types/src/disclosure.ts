export type DisclosureArray = [string, string, unknown] | [string, unknown]

export type Disclosure = {
    salt: string
    key?: string
    value: unknown
    encoded: string
}

export type DisclosureWithDigest = Disclosure & { digest: string }
