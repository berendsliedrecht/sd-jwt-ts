export type DisclosureArray = [string, string, unknown] | [string, unknown]

export type Disclosure = {
    salt: string
    key?: string
    value: unknown
}

export type DisclosureWithDigest = Disclosure & { digest: string }
