import { SignatureAndEncryptionAlgorithm } from './signatureAndEncryptionAlgorithm'

export type KeyBinding<
    H extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
> = {
    header: { typ: 'kb+jwt'; alg: SignatureAndEncryptionAlgorithm } & H
    payload: { iat: number; aud: string; nonce: string } & P
    signature: Uint8Array
}
