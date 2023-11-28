import { Buffer } from 'buffer'

export class Base64url {
    /**
     *
     * Encode into base64url string
     *
     */
    public static encode(input: string | Uint8Array | Buffer): string {
        return Buffer.from(input).toString('base64url')
    }

    /**
     *
     * Encode from JSON into a base64url string
     *
     */
    public static encodeFromJson(
        input: Record<string, unknown> | Array<unknown>
    ): string {
        return Buffer.from(JSON.stringify(input)).toString('base64url')
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
        return JSON.parse(Buffer.from(input, 'base64url').toString()) as T
    }

    /**
     *
     * Decode from base64url into a byte array
     *
     */
    public static decode(input: string): Uint8Array {
        return Uint8Array.from(Buffer.from(input, 'base64url'))
    }
}
