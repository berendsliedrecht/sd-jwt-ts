import {
    createHash,
    generateKeyPairSync,
    getRandomValues,
    sign,
    verify
} from 'node:crypto'
import { strictEqual } from 'node:assert'

import { Disclosure, SignatureAndEncryptionAlgorithm, Signer } from '../src'
import {
    HasherAlgorithm,
    HasherAndAlgorithm,
    SaltGenerator
} from '../src/sdJwt'
import { Verifier } from '../src/sdJwt/types'

const { publicKey, privateKey } = generateKeyPairSync('ed25519')

/**
 * This swaps the default JSON serializer to one that is, more, compatible with Python `json.dumps`.
 * This is because the default json parser adds whitespace after the `:` after a key and after every `,`.
 */
export const prelude = () => {
    const oldStringify = JSON.stringify
    global.JSON.stringify = (x: unknown) =>
        oldStringify(x, null, 0).split('",').join('", ').split('":').join('": ')
}

export const hasherAndAlgorithm: HasherAndAlgorithm = {
    hasher: (input: string) =>
        createHash('sha256').update(input).digest().toString('base64url'),

    algorithm: HasherAlgorithm.Sha256
}

export const signer: Signer = (input, header) => {
    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }
    return sign(null, Buffer.from(input), privateKey)
}

export const verifier: Verifier = ({ header, message, signature }) => {
    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }

    return verify(null, Buffer.from(message), publicKey, signature)
}

export const saltGenerator: SaltGenerator = () =>
    getRandomValues(Buffer.alloc(16)).toString('base64url')

export const testCreateDisclosureObjectAndHash = async (
    input: [string, string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => {
    const disclosure = new Disclosure(input[0], input[2], input[1])

    strictEqual(disclosure.encoded, expectedDisclosure)

    const hash = await disclosure.digest(hasherAndAlgorithm.hasher)

    strictEqual(hash, expectedHash)
}

export const testCreateDisclosureArrayAndHash = async (
    input: [string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => {
    const disclosure = new Disclosure(input[0], input[1])

    strictEqual(disclosure.encoded, expectedDisclosure)

    const hash = await disclosure.digest(hasherAndAlgorithm.hasher)

    strictEqual(hash, expectedHash)
}
