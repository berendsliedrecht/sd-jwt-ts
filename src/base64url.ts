import { Buffer } from 'buffer'

export class Base64url {
    public static encode(input: string | Uint8Array | Buffer): string {
        return Buffer.from(input).toString('base64url')
    }

    public static encodeFromJson(
        input: Record<string, unknown> | Array<unknown>
    ): string {
        return Buffer.from(JSON.stringify(input)).toString('base64url')
    }

    public static decodeToJson<
        T extends Record<string, unknown> | Array<unknown> = Record<
            string,
            unknown
        >
    >(input: string): T {
        return JSON.parse(Buffer.from(input, 'base64url').toString()) as T
    }

    public static decode(input: string): Uint8Array {
        return Uint8Array.from(Buffer.from(input, 'base64url'))
    }
}
