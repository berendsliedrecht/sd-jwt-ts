'use strict'
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected)
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            )
        })
    }
Object.defineProperty(exports, '__esModule', { value: true })
exports.testCreateDisclosureArrayAndHash =
    exports.testCreateDisclosureObjectAndHash =
    exports.saltGenerator =
    exports.verifier =
    exports.keyBindingSigner =
    exports.signer =
    exports.hasherAndAlgorithm =
    exports.prelude =
    exports.publicHolderKeyJwk =
    exports.privateHolderKeyJwk =
        void 0
const node_crypto_1 = require('node:crypto')
const node_assert_1 = require('node:assert')
const src_1 = require('../src')
const { publicKey, privateKey } = (0, node_crypto_1.generateKeyPairSync)(
    'ed25519'
)
exports.privateHolderKeyJwk = {
    jwk: {
        crv: 'Ed25519',
        d: 'H9Q5w7zcWkv4-N7vdsDSwKKkYtgxuZvseuMiBc40PQc',
        x: 'CirZn-V9n_KRh8c2IyWqOtrVm9wlzaVDDS8Y4zGmQso',
        kty: 'OKP'
    }
}
exports.publicHolderKeyJwk = {
    jwk: {
        crv: exports.privateHolderKeyJwk.jwk.crv,
        kty: exports.privateHolderKeyJwk.jwk.kty,
        x: exports.privateHolderKeyJwk.jwk.x
    }
}
/**
 * This swaps the default JSON serializer to one that is, more, compatible with Python `json.dumps`.
 * This is because the default json parser adds whitespace after the `:` after a key and after every `,`.
 */
const prelude = () => {
    const oldStringify = JSON.stringify
    global.JSON.stringify = (x) =>
        oldStringify(x, null, 0).split('",').join('", ').split('":').join('": ')
}
exports.prelude = prelude
exports.hasherAndAlgorithm = {
    hasher: (input) =>
        (0, node_crypto_1.createHash)('sha256').update(input).digest(),
    algorithm: src_1.HasherAlgorithm.Sha256
}
const signer = (input, header) => {
    if (header.alg !== src_1.SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }
    return (0, node_crypto_1.sign)(null, Buffer.from(input), privateKey)
}
exports.signer = signer
const keyBindingSigner = (input, header) => {
    if (header.alg !== src_1.SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }
    const keyBindingPrivateKey = (0, node_crypto_1.createPrivateKey)({
        key: exports.privateHolderKeyJwk.jwk,
        format: 'jwk'
    })
    return (0, node_crypto_1.sign)(
        null,
        Buffer.from(input),
        keyBindingPrivateKey
    )
}
exports.keyBindingSigner = keyBindingSigner
const verifier = ({ header, message, signature }) => {
    if (header.alg !== src_1.SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }
    return (0, node_crypto_1.verify)(
        null,
        Buffer.from(message),
        publicKey,
        signature
    )
}
exports.verifier = verifier
const saltGenerator = () =>
    (0, node_crypto_1.getRandomValues)(Buffer.alloc(16)).toString('base64url')
exports.saltGenerator = saltGenerator
const testCreateDisclosureObjectAndHash = (
    input,
    expectedDisclosure,
    expectedHash
) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const disclosure = new src_1.Disclosure(input[0], input[2], input[1])
        ;(0, node_assert_1.strictEqual)(disclosure.encoded, expectedDisclosure)
        const hash = yield disclosure.digest(exports.hasherAndAlgorithm.hasher)
        ;(0, node_assert_1.strictEqual)(hash, expectedHash)
    })
exports.testCreateDisclosureObjectAndHash = testCreateDisclosureObjectAndHash
const testCreateDisclosureArrayAndHash = (
    input,
    expectedDisclosure,
    expectedHash
) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const disclosure = new src_1.Disclosure(input[0], input[1])
        ;(0, node_assert_1.strictEqual)(disclosure.encoded, expectedDisclosure)
        const hash = yield disclosure.digest(exports.hasherAndAlgorithm.hasher)
        ;(0, node_assert_1.strictEqual)(hash, expectedHash)
    })
exports.testCreateDisclosureArrayAndHash = testCreateDisclosureArrayAndHash
//# sourceMappingURL=utils.js.map
