import { Buffer } from 'buffer'

export class Base64url {
    /**
     *
     * Encode into base64url string
     *
     */
    public static encode(input: string | Uint8Array | Buffer): string {
        return base64ToBase64URL(Buffer.from(input).toString('base64'))
    }

    /**
     *
     * Encode from JSON into a base64url string
     *
     */
    public static encodeFromJson(
        input: Record<string, unknown> | Array<unknown>
    ): string {
        return base64ToBase64URL(
            Buffer.from(JSON.stringify(input)).toString('base64')
        )
    }

    /**
     *
     * Decode from base64url into JSON
     *
     */
    public static decodeToJson<
        T extends Record<string, unknown> | Array<unknown> = Record<
            string,
            unknown
        >
    >(input: string): T {
        return JSON.parse(Buffer.from(input, 'base64').toString()) as T
    }

    /**
     *
     * Decode from base64url into a byte array
     *
     */
    public static decode(input: string): Uint8Array {
        return Uint8Array.from(Buffer.from(input, 'base64'))
    }
}

export function base64ToBase64URL(base64: string) {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
