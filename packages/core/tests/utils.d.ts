import { Signer, HasherAndAlgorithm, SaltGenerator, Verifier } from '../src'
export declare const privateHolderKeyJwk: {
    jwk: {
        crv: string
        d: string
        x: string
        kty: string
    }
}
export declare const publicHolderKeyJwk: {
    jwk: {
        crv: string
        kty: string
        x: string
    }
}
/**
 * This swaps the default JSON serializer to one that is, more, compatible with Python `json.dumps`.
 * This is because the default json parser adds whitespace after the `:` after a key and after every `,`.
 */
export declare const prelude: () => void
export declare const hasherAndAlgorithm: HasherAndAlgorithm
export declare const signer: Signer
export declare const keyBindingSigner: Signer
export declare const verifier: Verifier
export declare const saltGenerator: SaltGenerator
export declare const testCreateDisclosureObjectAndHash: (
    input: [string, string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => Promise<void>
export declare const testCreateDisclosureArrayAndHash: (
    input: [string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => Promise<void>
