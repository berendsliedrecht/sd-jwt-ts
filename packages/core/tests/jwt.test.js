'use strict'
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              var desc = Object.getOwnPropertyDescriptor(m, k)
              if (
                  !desc ||
                  ('get' in desc
                      ? !m.__esModule
                      : desc.writable || desc.configurable)
              ) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k]
                      }
                  }
              }
              Object.defineProperty(o, k2, desc)
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              o[k2] = m[k]
          })
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v
              })
          }
        : function (o, v) {
              o['default'] = v
          })
var __importStar =
    (this && this.__importStar) ||
    function (mod) {
        if (mod && mod.__esModule) return mod
        var result = {}
        if (mod != null)
            for (var k in mod)
                if (
                    k !== 'default' &&
                    Object.prototype.hasOwnProperty.call(mod, k)
                )
                    __createBinding(result, mod, k)
        __setModuleDefault(result, mod)
        return result
    }
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
const node_test_1 = require('node:test')
const node_assert_1 = __importStar(require('node:assert'))
const utils_1 = require('./utils')
const src_1 = require('../src')
;(0, node_test_1.describe)('JWT', () =>
    __awaiter(void 0, void 0, void 0, function* () {
        ;(0, node_test_1.before)(utils_1.prelude)
        ;(0, node_test_1.describe)('Creation', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('create basic JWT', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const jwt = new src_1.Jwt({
                            header: { alg: 'ES256' },
                            payload: { iss: 'https://example.org' },
                            signature: new Uint8Array(32).fill(42)
                        })
                        const compactJwt = yield jwt.toCompact()
                        ;(0, node_assert_1.strictEqual)(
                            compactJwt,
                            'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                        )
                    })
                )
                ;(0, node_test_1.it)(
                    'create basic JWT with "add" builder',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.Jwt()
                                .addHeaderClaim('alg', 'ES256')
                                .addPayloadClaim('iss', 'https://example.org')
                                .withSignature(new Uint8Array(32).fill(42))
                            const compactJwt = yield jwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                compactJwt,
                                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'create basic JWT with "with" builder',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.Jwt()
                                .withHeader({ alg: 'ES256' })
                                .withPayload({ iss: 'https://example.org' })
                                .withSignature(new Uint8Array(32).fill(42))
                            const compactJwt = yield jwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                compactJwt,
                                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'create basic JWT and override property',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.Jwt()
                                .withHeader({ alg: 'EdDSA' })
                                .withPayload({ iss: 'https://example.org' })
                                .withSignature(new Uint8Array(32).fill(42))
                            const jwtWithNewAlg = jwt.addHeaderClaim(
                                'alg',
                                'ES256'
                            )
                            const compactJwt = yield jwtWithNewAlg.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                compactJwt,
                                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                            )
                        })
                )
                ;(0, node_test_1.it)('create basic JWT with fake signer', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const jwt = new src_1.Jwt()
                            .withHeader({ alg: 'ES256' })
                            .withPayload({ iss: 'https://example.org' })
                            .withSigner(() => new Uint8Array(32).fill(42))
                        const compactJwt = yield jwt.toCompact()
                        ;(0, node_assert_1.strictEqual)(
                            compactJwt,
                            'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                        )
                    })
                )
                ;(0, node_test_1.it)('create basic JWT with signer', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const jwt = new src_1.Jwt()
                            .withHeader({ alg: 'ES256' })
                            .withPayload({ iss: 'https://example.org' })
                            // mock signing function that uses the input to create a signature-like array
                            .withSigner((input) =>
                                Uint8Array.from(
                                    Buffer.from(
                                        Buffer.from(input).toString('hex')
                                    )
                                )
                            )
                        const compactJwt = yield jwt.toCompact()
                        ;(0, node_assert_1.strictEqual)(
                            compactJwt,
                            'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.NjU3OTRhNjg2MjQ3NjM2OTRmNjk0MTY5NTI1NjRkNzk0ZTU0NTk2OTY2NTEyZTY1Nzk0YTcwNjMzMzRkNjk0ZjY5NDE2OTYxNDg1MjMwNjM0ODRkMzY0Yzc5Mzk2YzY1NDc0Njc0NjM0Nzc4NmM0YzZkMzk3OTVhNzk0YTM5'
                        )
                    })
                )
                ;(0, node_test_1.it)('create basic JWT from compact', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const header = {
                            alg: 'ES256'
                        }
                        const payload = {
                            iss: 'https://example.org'
                        }
                        const signature = new Uint8Array(32).fill(42)
                        const jwt = new src_1.Jwt({
                            header,
                            payload,
                            signature
                        })
                        const compactJwt = yield jwt.toCompact()
                        ;(0, node_assert_1.strictEqual)(
                            compactJwt,
                            'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                        )
                        const fromCompactJwt = src_1.Jwt.fromCompact(compactJwt)
                        ;(0, node_assert_1.deepStrictEqual)(
                            fromCompactJwt.header,
                            header
                        )
                        ;(0, node_assert_1.deepStrictEqual)(
                            fromCompactJwt.payload,
                            payload
                        )
                        ;(0, node_assert_1.deepStrictEqual)(
                            fromCompactJwt.signature,
                            signature
                        )
                    })
                )
            })
        )
        ;(0, node_test_1.describe)('jwt verification', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('should verify simple jwt', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const jwt = new src_1.Jwt()
                            .withHeader({
                                alg: src_1.SignatureAndEncryptionAlgorithm.EdDSA
                            })
                            .withPayload({ sign: 'me!' })
                            .withSigner(utils_1.signer)
                        const compact = yield jwt.toCompact()
                        ;(0, node_assert_1.strictEqual)(
                            typeof compact,
                            'string'
                        )
                        const fromCompact = src_1.Jwt.fromCompact(compact)
                        const { isSignatureValid, isValid } =
                            yield fromCompact.verify(utils_1.verifier)
                        ;(0, node_assert_1.default)(isSignatureValid)
                        ;(0, node_assert_1.default)(isValid)
                    })
                )
                ;(0, node_test_1.it)('should verify simple jwt with exp', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const nextMonth = new Date()
                        nextMonth.setMonth(new Date().getMonth() + 1)
                        const jwt = new src_1.Jwt()
                            .withHeader({
                                alg: src_1.SignatureAndEncryptionAlgorithm.EdDSA
                            })
                            .withPayload({
                                sign: 'me!',
                                exp: nextMonth.getTime() / 1000
                            })
                            .withSigner(utils_1.signer)
                        const compact = yield jwt.toCompact()
                        ;(0, node_assert_1.strictEqual)(
                            typeof compact,
                            'string'
                        )
                        const fromCompact = src_1.Jwt.fromCompact(compact)
                        const { isSignatureValid, isValid, isExpiryTimeValid } =
                            yield fromCompact.verify(utils_1.verifier)
                        ;(0, node_assert_1.default)(isSignatureValid)
                        ;(0, node_assert_1.default)(isExpiryTimeValid)
                        ;(0, node_assert_1.default)(isValid)
                    })
                )
                ;(0, node_test_1.it)('should verify simple jwt with nbf', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const lastMonth = new Date()
                        lastMonth.setMonth(new Date().getMonth() - 1)
                        const jwt = new src_1.Jwt()
                            .withHeader({
                                alg: src_1.SignatureAndEncryptionAlgorithm.EdDSA
                            })
                            .withPayload({
                                sign: 'me!',
                                nbf: lastMonth.getTime() / 1000
                            })
                            .withSigner(utils_1.signer)
                        const compact = yield jwt.toCompact()
                        ;(0, node_assert_1.strictEqual)(
                            typeof compact,
                            'string'
                        )
                        const fromCompact = src_1.Jwt.fromCompact(compact)
                        const { isSignatureValid, isValid, isNotBeforeValid } =
                            yield fromCompact.verify(utils_1.verifier)
                        ;(0, node_assert_1.default)(isSignatureValid)
                        ;(0, node_assert_1.default)(isNotBeforeValid)
                        ;(0, node_assert_1.default)(isValid)
                    })
                )
                ;(0, node_test_1.it)(
                    'should verify simple jwt with required claims',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const lastMonth = new Date()
                            lastMonth.setMonth(new Date().getMonth() - 1)
                            const jwt = new src_1.Jwt()
                                .withHeader({
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                })
                                .withPayload({
                                    sign: 'me!',
                                    nbf: lastMonth.getTime() / 1000
                                })
                                .withSigner(utils_1.signer)
                            const compact = yield jwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const fromCompact = src_1.Jwt.fromCompact(compact)
                            const {
                                isSignatureValid,
                                isValid,
                                areRequiredClaimsIncluded
                            } = yield fromCompact.verify(utils_1.verifier, [
                                'sign'
                            ])
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(
                                areRequiredClaimsIncluded
                            )
                            ;(0, node_assert_1.default)(isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'should verify simple jwt with all fields',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const lastMonth = new Date()
                            lastMonth.setMonth(new Date().getMonth() - 1)
                            const nextMonth = new Date()
                            nextMonth.setMonth(new Date().getMonth() + 1)
                            const jwt = new src_1.Jwt()
                                .withHeader({
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                })
                                .withPayload({
                                    sign: 'me!',
                                    nbf: lastMonth.getTime() / 1000,
                                    exp: nextMonth.getTime() / 1000
                                })
                                .withSigner(utils_1.signer)
                            const compact = yield jwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const fromCompact = src_1.Jwt.fromCompact(compact)
                            const {
                                isSignatureValid,
                                isValid,
                                areRequiredClaimsIncluded,
                                isNotBeforeValid,
                                isExpiryTimeValid
                            } = yield fromCompact.verify(utils_1.verifier, [
                                'sign'
                            ])
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(isExpiryTimeValid)
                            ;(0, node_assert_1.default)(isNotBeforeValid)
                            ;(0, node_assert_1.default)(
                                areRequiredClaimsIncluded
                            )
                            ;(0, node_assert_1.default)(isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'should not verify simple jwt with invalid signature',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.Jwt()
                                .withHeader({
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                })
                                .withPayload({
                                    sign: 'me!'
                                })
                                .withSignature(new Uint8Array(32).fill(42))
                            const compact = yield jwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const fromCompact = src_1.Jwt.fromCompact(compact)
                            const { isSignatureValid, isValid } =
                                yield fromCompact.verify(utils_1.verifier)
                            ;(0, node_assert_1.default)(!isSignatureValid)
                            ;(0, node_assert_1.default)(!isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'should not verify simple jwt with invalid exp',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const lastMonth = new Date()
                            lastMonth.setMonth(new Date().getMonth() - 1)
                            const jwt = new src_1.Jwt()
                                .withHeader({
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                })
                                .withPayload({
                                    sign: 'me!',
                                    exp: lastMonth.getTime() / 1000
                                })
                                .withSigner(utils_1.signer)
                            const compact = yield jwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const fromCompact = src_1.Jwt.fromCompact(compact)
                            const {
                                isSignatureValid,
                                isValid,
                                isExpiryTimeValid
                            } = yield fromCompact.verify(utils_1.verifier)
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(!isExpiryTimeValid)
                            ;(0, node_assert_1.default)(!isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'should not verify simple jwt with invalid nbf',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const nextMonth = new Date()
                            nextMonth.setMonth(new Date().getMonth() + 1)
                            const jwt = new src_1.Jwt()
                                .withHeader({
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                })
                                .withPayload({
                                    sign: 'me!',
                                    nbf: nextMonth.getTime() / 1000
                                })
                                .withSigner(utils_1.signer)
                            const compact = yield jwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const fromCompact = src_1.Jwt.fromCompact(compact)
                            const {
                                isSignatureValid,
                                isValid,
                                isNotBeforeValid
                            } = yield fromCompact.verify(utils_1.verifier)
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(!isNotBeforeValid)
                            ;(0, node_assert_1.default)(!isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'should not verify simple jwt with invalid required claims',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.Jwt()
                                .withHeader({
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                })
                                .withPayload({
                                    sign: 'me!'
                                })
                                .withSigner(utils_1.signer)
                            const compact = yield jwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const fromCompact = src_1.Jwt.fromCompact(compact)
                            const {
                                isSignatureValid,
                                isValid,
                                areRequiredClaimsIncluded
                            } = yield fromCompact.verify(utils_1.verifier, [
                                'claim_a',
                                'claim_b',
                                'nbf',
                                'iss'
                            ])
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(!isValid)
                            ;(0, node_assert_1.default)(
                                !areRequiredClaimsIncluded
                            )
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('assert claims', () => {
            ;(0, node_test_1.it)(
                'assert top-level claims in payload and header',
                () => {
                    const jwt = new src_1.Jwt({
                        header: { alg: 'ES256' },
                        payload: { iss: 'https://example.org' },
                        signature: new Uint8Array(32).fill(42)
                    })
                    ;(0, node_assert_1.doesNotThrow)(() =>
                        jwt.assertClaimInPayload('iss', 'https://example.org')
                    )
                    ;(0, node_assert_1.doesNotThrow)(() =>
                        jwt.assertClaimInHeader('alg', 'ES256')
                    )
                }
            )
            ;(0, node_test_1.it)(
                'assert nested-level claims in payload and header',
                () => {
                    const jwt = new src_1.Jwt({
                        header: {
                            alg: 'ES256',
                            nested: { nestedHeaderClaim: 'foo' }
                        },
                        payload: {
                            iss: 'https://example.org',
                            nested: { nestedPayloadClaim: [1, 2, 3] }
                        },
                        signature: new Uint8Array(32).fill(42)
                    })
                    ;(0, node_assert_1.doesNotThrow)(() =>
                        jwt.assertClaimInPayload(
                            'nestedPayloadClaim',
                            [1, 2, 3]
                        )
                    )
                    ;(0, node_assert_1.doesNotThrow)(() =>
                        jwt.assertClaimInHeader('nestedHeaderClaim', 'foo')
                    )
                }
            )
        })
        ;(0, node_test_1.describe)('get claims', () => {
            ;(0, node_test_1.it)(
                'get assert top-level claims in payload and header',
                () => {
                    const jwt = new src_1.Jwt({
                        header: { alg: 'ES256' },
                        payload: { iss: 'https://example.org' },
                        signature: new Uint8Array(32).fill(42)
                    })
                    ;(0, node_assert_1.deepStrictEqual)(
                        jwt.getClaimInHeader('alg'),
                        'ES256'
                    )
                    ;(0, node_assert_1.deepStrictEqual)(
                        jwt.getClaimInPayload('iss'),
                        'https://example.org'
                    )
                }
            )
            ;(0, node_test_1.it)(
                'assert nested-level claims in payload and header',
                () => {
                    const jwt = new src_1.Jwt({
                        header: {
                            alg: 'ES256',
                            nested: { nestedHeaderClaim: 'foo' }
                        },
                        payload: {
                            iss: 'https://example.org',
                            nested: { nestedPayloadClaim: [1, 2, 3] }
                        },
                        signature: new Uint8Array(32).fill(42)
                    })
                    ;(0, node_assert_1.deepStrictEqual)(
                        jwt.getClaimInPayload('nestedPayloadClaim'),
                        [1, 2, 3]
                    )
                    ;(0, node_assert_1.deepStrictEqual)(
                        jwt.getClaimInHeader('nestedHeaderClaim'),
                        'foo'
                    )
                }
            )
        })
    })
)
//# sourceMappingURL=jwt.test.js.map
