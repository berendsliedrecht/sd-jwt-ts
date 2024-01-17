import {
    createHash,
    createPrivateKey,
    generateKeyPairSync,
    getRandomValues,
    sign,
    verify
} from 'node:crypto'
import { strictEqual } from 'node:assert'

import {
    Disclosure,
    SignatureAndEncryptionAlgorithm,
    Signer,
    HasherAlgorithm,
    HasherAndAlgorithm,
    SaltGenerator,
    Verifier
} from '../src'

const { publicKey, privateKey } = generateKeyPairSync('ed25519')

export const privateHolderKeyJwk = {
    jwk: {
        crv: 'Ed25519',
        d: 'H9Q5w7zcWkv4-N7vdsDSwKKkYtgxuZvseuMiBc40PQc',
        x: 'CirZn-V9n_KRh8c2IyWqOtrVm9wlzaVDDS8Y4zGmQso',
        kty: 'OKP'
    }
}

export const publicHolderKeyJwk = {
    jwk: {
        crv: privateHolderKeyJwk.jwk.crv,
        kty: privateHolderKeyJwk.jwk.kty,
        x: privateHolderKeyJwk.jwk.x
    }
}

/**
 * This swaps the default JSON serializer to one that is, more, compatible with Python `json.dumps`.
 * This is because the default json parser adds whitespace after the `:` after a key and after every `,`.
 */
export const prelude = () => {
    const oldStringify = JSON.stringify
    global.JSON.stringify = (x: unknown) =>
        oldStringify(x, null, 0).split('",').join('", ').split('":').join('": ')
}

export const hasherAndAlgorithm = {
    hasher: (input: string) => createHash('sha256').update(input).digest(),
    algorithm: HasherAlgorithm.Sha256
} as const satisfies HasherAndAlgorithm

export const signer: Signer = (input, header) => {
    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }
    return sign(null, Buffer.from(input), privateKey)
}

export const keyBindingSigner: Signer = (input, header) => {
    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }

    const keyBindingPrivateKey = createPrivateKey({
        key: privateHolderKeyJwk.jwk,
        format: 'jwk'
    })

    return sign(null, Buffer.from(input), keyBindingPrivateKey)
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
    await disclosure.withCalculateDigest(hasherAndAlgorithm)

    strictEqual(disclosure.digest, expectedHash)
}

export const testCreateDisclosureArrayAndHash = async (
    input: [string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => {
    const disclosure = new Disclosure(input[0], input[1])

    strictEqual(disclosure.encoded, expectedDisclosure)

    await disclosure.withCalculateDigest(hasherAndAlgorithm)

    strictEqual(disclosure.digest, expectedHash)
}
