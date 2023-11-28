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
;(0, node_test_1.describe)('sd-jwt', () =>
    __awaiter(void 0, void 0, void 0, function* () {
        ;(0, node_test_1.before)(utils_1.prelude)
        ;(0, node_test_1.describe)('utility', () => {
            ;(0, node_test_1.it)('Check correct hashing algorithm', () => {
                const sdJwt = new src_1.SdJwt({
                    payload: { some: 'payload' }
                })
                    .withHasher(utils_1.hasherAndAlgorithm)
                    .addHasherAlgorithmToPayload()
                ;(0, node_assert_1.default)(
                    sdJwt.checkHasher(src_1.HasherAlgorithm.Sha256)
                )
            })
            ;(0, node_test_1.it)('Check incorrect hashing algorithm', () => {
                const sdJwt = new src_1.SdJwt({
                    payload: { some: 'payload' }
                })
                    .withHasher(utils_1.hasherAndAlgorithm)
                    .addHasherAlgorithmToPayload()
                ;(0, node_assert_1.default)(
                    !sdJwt.checkHasher(src_1.HasherAlgorithm.Sha3_256)
                )
            })
        })
        ;(0, node_test_1.describe)('assert in disclosure frame', () => {
            ;(0, node_test_1.it)('assert claim in disclosure frame', () => {
                const sdJwt = new src_1.SdJwt(
                    { header: { a: 'b' }, payload: { c: 'd' } },
                    { disclosureFrame: { c: true } }
                )
                ;(0, node_assert_1.doesNotThrow)(() =>
                    sdJwt.assertClaimInDisclosureFrame('c')
                )
            })
            ;(0, node_test_1.it)('assert claims in disclosure frame', () => {
                const sdJwt = new src_1.SdJwt(
                    { header: { a: 'b' }, payload: { c: 'd', e: 'f', g: 'h' } },
                    { disclosureFrame: { c: true, g: true } }
                )
                ;(0, node_assert_1.doesNotThrow)(() =>
                    sdJwt.assertClaimInDisclosureFrame('c')
                )
                ;(0, node_assert_1.doesNotThrow)(() =>
                    sdJwt.assertClaimInDisclosureFrame('g')
                )
            })
            ;(0, node_test_1.it)('assert claim not in disclosure frame', () => {
                const sdJwt = new src_1.SdJwt(
                    { header: { a: 'b' }, payload: { c: 'd' } },
                    { disclosureFrame: { c: true } }
                )
                ;(0, node_assert_1.throws)(() =>
                    sdJwt.assertClaimInDisclosureFrame('z')
                )
            })
            ;(0, node_test_1.it)(
                'assert claims not in disclosure frame',
                () => {
                    const sdJwt = new src_1.SdJwt(
                        {
                            header: { a: 'b' },
                            payload: { c: 'd', e: 'f', g: 'h' }
                        },
                        { disclosureFrame: { c: true, g: true } }
                    )
                    ;(0, node_assert_1.throws)(() =>
                        sdJwt.assertClaimInDisclosureFrame('e')
                    )
                }
            )
        })
        ;(0, node_test_1.describe)('JWT without selective disclosure', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('should create a simple jwt', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const sdJwt = yield new src_1.SdJwt({
                            header: { kid: 'a' },
                            payload: { exp: 123 },
                            signature: Uint8Array.from([1, 2, 3])
                        }).toCompact()
                        ;(0, node_assert_1.deepStrictEqual)(
                            sdJwt,
                            'eyJraWQiOiAiYSJ9.eyJleHAiOiAxMjN9.AQID'
                        )
                    })
                )
                ;(0, node_test_1.it)(
                    'should create a simple jwt with builder',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = yield new src_1.SdJwt()
                                .withHeader({ kid: 'a' })
                                .withPayload({ exp: 123 })
                                .withSignature(Uint8Array.from([1, 2, 3]))
                                .toCompact()
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt,
                                'eyJraWQiOiAiYSJ9.eyJleHAiOiAxMjN9.AQID'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should create a simple jwt with builder',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = yield new src_1.SdJwt()
                                .withHeader({ kid: 'a' })
                                .withPayload({ exp: 123 })
                                .withSignature(Uint8Array.from([1, 2, 3]))
                                .toCompact()
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt,
                                'eyJraWQiOiAiYSJ9.eyJleHAiOiAxMjN9.AQID'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should create a simple jwt with add builder',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = yield new src_1.SdJwt()
                                .addHeaderClaim('kid', 'a')
                                .addPayloadClaim('exp', 123)
                                .withSignature(Uint8Array.from([1, 2, 3]))
                                .toCompact()
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt,
                                'eyJraWQiOiAiYSJ9.eyJleHAiOiAxMjN9.AQID'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should create an instance of sdJwt from a compact sdJwt',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = src_1.SdJwt.fromCompact(
                                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID'
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt.header.kid,
                                'a'
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt.payload.exp,
                                123
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt.signature,
                                Uint8Array.from([1, 2, 3])
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should create an instance of sdJwt from a compact sdJwt with disclosable',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            var _a
                            const sdJwt = src_1.SdJwt.fromCompact(
                                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID~WyJDa0J1NE1NNklkX3RSUmRYMVptOC13IiwiZmlyc3RfbmFtZSIsIkJlcmVuZCBTbGllZHJlY2h0Il0~'
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt.header.kid,
                                'a'
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt.payload.exp,
                                123
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt.signature,
                                Uint8Array.from([1, 2, 3])
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                (_a = sdJwt.disclosures) === null ||
                                    _a === void 0
                                    ? void 0
                                    : _a.map((d) => d.toString()),
                                [
                                    'WyJDa0J1NE1NNklkX3RSUmRYMVptOC13IiwgImZpcnN0X25hbWUiLCAiQmVyZW5kIFNsaWVkcmVjaHQiXQ'
                                ]
                            )
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('JWT assert correct methods', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'should error when creating compact format without header',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt()
                                .addPayloadClaim('exp', 123)
                                .withSignature(Uint8Array.from([1, 2, 3]))
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwt.toCompact()
                                        }
                                    ),
                                new src_1.SdJwtError('Header must be defined')
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should error when creating compact format without payload',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt()
                                .addHeaderClaim('kid', 'a')
                                .withSignature(Uint8Array.from([1, 2, 3]))
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwt.toCompact()
                                        }
                                    ),
                                new src_1.SdJwtError('Payload must be defined')
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should error when no salt method is provided',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    new src_1.SdJwt(
                                        {
                                            header: { kid: 'a' },
                                            payload: { exp: 123, sub: 'a' },
                                            signature: Uint8Array.from([
                                                1, 2, 3
                                            ])
                                        },
                                        {
                                            disclosureFrame: { sub: true },
                                            hasherAndAlgorithm: {
                                                hasher: () =>
                                                    Buffer.from('hash'),
                                                algorithm:
                                                    src_1.HasherAlgorithm.Sha256
                                            }
                                        }
                                    ).toCompact(),
                                new src_1.SdJwtError(
                                    'Cannot create a disclosure without a salt generator. You can set it with this.withSaltGenerator()'
                                )
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should error when no hash method is provided',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    new src_1.SdJwt(
                                        {
                                            header: { kid: 'a' },
                                            payload: { exp: 123, sub: 'a' },
                                            signature: Uint8Array.from([
                                                1, 2, 3
                                            ])
                                        },
                                        { disclosureFrame: { sub: true } }
                                    )
                                        .withSaltGenerator(() => 'salt')
                                        .toCompact(),
                                new src_1.SdJwtError(
                                    'A hasher and algorithm must be set in order to create a digest of a disclosure. You can set it with this.withHasherAndAlgorithm()'
                                )
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should error when no signer method is provided',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    new src_1.SdJwt(
                                        {
                                            header: { kid: 'a' },
                                            payload: { exp: 123, sub: 'a' },
                                            signature: Uint8Array.from([
                                                1, 2, 3
                                            ])
                                        },
                                        { disclosureFrame: { sub: true } }
                                    ).signAndAdd(),
                                new src_1.SdJwtError(
                                    'A signer must be provided to create a signature. You can set it with this.withSigner()'
                                )
                            )
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('SD-JWT with array disclosures', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'should create an sd-jwt with selectively disclosed array items',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt(
                                {
                                    header: { alg: 'EdDSA' },
                                    payload: { arr: ['DE', 'FR'] }
                                },
                                {
                                    signer: () => new Uint8Array(32).fill(41),
                                    saltGenerator: () => 'salt',
                                    disclosureFrame: { arr: [true, false] },
                                    hasherAndAlgorithm: {
                                        hasher: () => Buffer.from('hash'),
                                        algorithm: src_1.HasherAlgorithm.Sha256
                                    }
                                }
                            )
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                compact,
                                'eyJhbGciOiAiRWREU0EifQ.eyJhcnIiOiBbeyIuLi4iOiAiYUdGemFBIn0sIkZSIl0sIl9zZF9hbGciOiAic2hhLTI1NiJ9.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgIkRFIl0~'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'Specification: 5.5.  Example 1: SD-JWT',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            var _b
                            const sdJwt = new src_1.SdJwt(
                                {
                                    header: { alg: 'EdDSA' },
                                    payload: {
                                        iss: 'https://example.com/issuer',
                                        iat: 1683000000,
                                        exp: 1883000000,
                                        cnf: {
                                            jwk: {
                                                kty: 'EC',
                                                crv: 'P-256',
                                                x: 'TCAER19Zvu3OHF4j4W4vfSVoHIP1ILilDls7vCeGemc',
                                                y: 'ZxjiWWbZMQGHVWKVQ4hbSIirsVfuecCE6t4jT9F2HZQ'
                                            }
                                        },
                                        sub: 'user_42',
                                        given_name: 'John',
                                        family_name: 'Doe',
                                        email: 'johndoe@example.com',
                                        phone_number: '+1-202-555-0101',
                                        phone_number_verified: true,
                                        address: {
                                            street_address: '123 Main St',
                                            locality: 'Anytown',
                                            region: 'Anystate',
                                            country: 'US'
                                        },
                                        birthdate: '1940-01-01',
                                        updated_at: 1570000000,
                                        nationalities: ['US', 'DE']
                                    }
                                },
                                {
                                    signer: () => new Uint8Array(32).fill(41),
                                    saltGenerator: () => 'salt',
                                    disclosureFrame: {
                                        nationalities: [true, true],
                                        given_name: true,
                                        family_name: true,
                                        email: true,
                                        phone_number: true,
                                        phone_number_verified: true,
                                        address: true,
                                        birthdate: true,
                                        updated_at: true
                                    },
                                    hasherAndAlgorithm:
                                        utils_1.hasherAndAlgorithm
                                }
                            )
                            yield sdJwt.applyDisclosureFrame()
                            ;(0, node_assert_1.deepStrictEqual)(sdJwt.payload, {
                                _sd: [
                                    'GDNAhA1KJ4uGhYYoU0JJcnp3gtsDGztuxJ0IFAC58SU',
                                    'Lb_UqAXpB-C8zg5qlvUFqVwrwZHb7WQpjqXhVak4b9o',
                                    'LrPmlqrzFganLlJ1fxoMdXAem6yh0jqL6CkqZBR0pf8',
                                    'RieY25BMU1fcc9cohBgrgg-IwgTCLwzJAKrMjhSwBnE',
                                    'Xvnk2NazKhhvwzjUYluAERKn94VbeWUvMTBicqhoh1s',
                                    'gJj4j5kQkJ2cNXUtOslg8FVmko0ZxNRWQvA2c0DNfqI',
                                    'rcLAcaR4sE41DT7kDdVWlfPgZJ7NFoyQT9QPvfMwsWI',
                                    'vZFVynA4mLOmYXABeMt5wwbPa7BRnPvQiMRyz9N-bvc'
                                ],
                                iss: 'https://example.com/issuer',
                                iat: 1683000000,
                                exp: 1883000000,
                                sub: 'user_42',
                                nationalities: [
                                    {
                                        '...': 'idZBqJ4r38ap8caNNWJu1TWdsYBj6YmZn2Zg8L-kuoM'
                                    },
                                    {
                                        '...': 's5SKqapSBhyudPUpDAThlL9aIYUvHzB_mCPjzBtZLzw'
                                    }
                                ],
                                _sd_alg: 'sha-256',
                                cnf: {
                                    jwk: {
                                        kty: 'EC',
                                        crv: 'P-256',
                                        x: 'TCAER19Zvu3OHF4j4W4vfSVoHIP1ILilDls7vCeGemc',
                                        y: 'ZxjiWWbZMQGHVWKVQ4hbSIirsVfuecCE6t4jT9F2HZQ'
                                    }
                                }
                            })
                            ;(0, node_assert_1.deepStrictEqual)(
                                (_b = sdJwt.disclosures) === null ||
                                    _b === void 0
                                    ? void 0
                                    : _b.map((d) => d.toString()),
                                [
                                    'WyJzYWx0IiwgIlVTIl0',
                                    'WyJzYWx0IiwgIkRFIl0',
                                    'WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd',
                                    'WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd',
                                    'WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ',
                                    'WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ',
                                    'WyJzYWx0IiwgInBob25lX251bWJlcl92ZXJpZmllZCIsIHRydWVd',
                                    'WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0',
                                    'WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0',
                                    'WyJzYWx0IiwgInVwZGF0ZWRfYXQiLCAxNTcwMDAwMDAwXQ'
                                ]
                            )
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('SD-JWT with key binding', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'should create an sd-jwt with key binding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const keyBinding = new src_1.KeyBinding(
                                {
                                    header: {
                                        typ: 'kb+jwt',
                                        alg: src_1
                                            .SignatureAndEncryptionAlgorithm
                                            .ES256
                                    },
                                    payload: {
                                        iat: 123,
                                        nonce: 'secure-nonce',
                                        aud: 'https://example.org/audience'
                                    }
                                },
                                { signer: () => new Uint8Array(32).fill(42) }
                            )
                            const sdJwt = new src_1.SdJwt(
                                {
                                    header: { alg: 'EdDSA' },
                                    payload: {
                                        iss: 'https://example.org/issuer'
                                    },
                                    keyBinding
                                },
                                {
                                    signer: () => new Uint8Array(32).fill(41),
                                    saltGenerator: () => 'salt',
                                    disclosureFrame: {
                                        iss: true,
                                        __decoyCount: 1
                                    },
                                    hasherAndAlgorithm: {
                                        hasher: () => Buffer.from('hash'),
                                        algorithm: src_1.HasherAlgorithm.Sha256
                                    }
                                }
                            )
                            const compactSdJwt = yield sdJwt.toCompact()
                            ;(0, node_assert_1.default)(
                                !compactSdJwt.endsWith('~')
                            )
                            ;(0, node_assert_1.strictEqual)(
                                compactSdJwt,
                                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJhR0Z6YUEiLCAiYUdGemFBIl19.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~eyJ0eXAiOiAia2Irand0IiwgImFsZyI6ICJFUzI1NiJ9.eyJpYXQiOiAxMjMsIm5vbmNlIjogInNlY3VyZS1ub25jZSIsICJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should create an sd-jwt with key binding, without disclosures',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const keyBinding = new src_1.KeyBinding(
                                {
                                    header: {
                                        typ: 'kb+jwt',
                                        alg: src_1
                                            .SignatureAndEncryptionAlgorithm
                                            .ES256
                                    },
                                    payload: {
                                        iat: 123,
                                        nonce: 'secure-nonce',
                                        aud: 'https://example.org/audience'
                                    }
                                },
                                { signer: () => new Uint8Array(32).fill(42) }
                            )
                            const sdJwt = new src_1.SdJwt(
                                {
                                    header: { alg: 'EdDSA' },
                                    payload: {
                                        iss: 'https://example.org/issuer'
                                    },
                                    keyBinding
                                },
                                {
                                    signer: () => new Uint8Array(32).fill(41),
                                    saltGenerator: () => 'salt',
                                    hasherAndAlgorithm: {
                                        hasher: () => Buffer.from('hash'),
                                        algorithm: src_1.HasherAlgorithm.Sha256
                                    }
                                }
                            )
                            const compactSdJwt = yield sdJwt.toCompact()
                            ;(0, node_assert_1.default)(
                                !compactSdJwt.endsWith('~')
                            )
                            ;(0, node_assert_1.strictEqual)(
                                compactSdJwt,
                                'eyJhbGciOiAiRWREU0EifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9pc3N1ZXIifQ.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~eyJ0eXAiOiAia2Irand0IiwgImFsZyI6ICJFUzI1NiJ9.eyJpYXQiOiAxMjMsIm5vbmNlIjogInNlY3VyZS1ub25jZSIsICJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'create sd-jwt with key binding and compare',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const keyBinding = new src_1.KeyBinding(
                                {
                                    header: {
                                        typ: 'kb+jwt',
                                        alg: src_1
                                            .SignatureAndEncryptionAlgorithm
                                            .ES256
                                    },
                                    payload: {
                                        iat: 123,
                                        nonce: 'secure-nonce',
                                        aud: 'https://example.org/audience'
                                    }
                                },
                                { signer: () => new Uint8Array(32).fill(42) }
                            )
                            const sdJwt = new src_1.SdJwt(
                                {
                                    header: { alg: 'EdDSA' },
                                    payload: {
                                        iss: 'https://example.org/issuer'
                                    },
                                    keyBinding
                                },
                                {
                                    signer: () => new Uint8Array(32).fill(41),
                                    saltGenerator: () => 'salt',
                                    disclosureFrame: {
                                        iss: true,
                                        __decoyCount: 1
                                    },
                                    hasherAndAlgorithm: {
                                        hasher: () => Buffer.from('hash'),
                                        algorithm: src_1.HasherAlgorithm.Sha256
                                    }
                                }
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                sdJwt.keyBinding,
                                keyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'create sd-jwt with key binding from compact round trip',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const keyBinding = new src_1.KeyBinding(
                                {
                                    header: {
                                        typ: 'kb+jwt',
                                        alg: src_1
                                            .SignatureAndEncryptionAlgorithm
                                            .ES256
                                    },
                                    payload: {
                                        iat: 123,
                                        nonce: 'secure-nonce',
                                        aud: 'https://example.org/audience'
                                    }
                                },
                                { signer: () => new Uint8Array(32).fill(42) }
                            )
                            const sdJwt = new src_1.SdJwt(
                                {
                                    header: { alg: 'EdDSA' },
                                    payload: {
                                        iss: 'https://example.org/issuer'
                                    },
                                    keyBinding
                                },
                                {
                                    signer: () => new Uint8Array(32).fill(41),
                                    saltGenerator: () => 'salt',
                                    disclosureFrame: {
                                        iss: true,
                                        __decoyCount: 1
                                    },
                                    hasherAndAlgorithm: {
                                        hasher: () => Buffer.from('hash'),
                                        algorithm: src_1.HasherAlgorithm.Sha256
                                    }
                                }
                            )
                            const compactSdJwt = yield sdJwt.toCompact()
                            ;(0, node_assert_1.default)(
                                !compactSdJwt.endsWith('~')
                            )
                            ;(0, node_assert_1.strictEqual)(
                                compactSdJwt,
                                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJhR0Z6YUEiLCAiYUdGemFBIl19.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~eyJ0eXAiOiAia2Irand0IiwgImFsZyI6ICJFUzI1NiJ9.eyJpYXQiOiAxMjMsIm5vbmNlIjogInNlY3VyZS1ub25jZSIsICJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                            )
                            const fromCompactSdJwt = src_1.SdJwt.fromCompact(
                                compactSdJwt
                            ).withSigner(() => new Uint8Array(32).fill(42))
                            const roundTrippedSdJwt =
                                yield fromCompactSdJwt.toCompact()
                            ;(0, node_assert_1.deepStrictEqual)(
                                compactSdJwt,
                                roundTrippedSdJwt
                            )
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('from and to compact form', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('create a simple compact sd-jwt', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const sdJwt = new src_1.SdJwt(
                            {
                                header: { alg: 'EdDSA' },
                                payload: { iss: 'https://example.org/issuer' }
                            },
                            {
                                signer: () => new Uint8Array(32).fill(41),
                                saltGenerator: () => 'salt',
                                disclosureFrame: { iss: true, __decoyCount: 1 },
                                hasherAndAlgorithm: {
                                    hasher: () => Buffer.from('hash'),
                                    algorithm: src_1.HasherAlgorithm.Sha256
                                }
                            }
                        )
                        ;(0, node_assert_1.strictEqual)(
                            yield sdJwt.toCompact(),
                            'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJhR0Z6YUEiLCAiYUdGemFBIl19.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~'
                        )
                    })
                )
                ;(0, node_test_1.it)('create a complex compact sd-jwt', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const sdJwt = new src_1.SdJwt(
                            {
                                header: { alg: 'EdDSA' },
                                payload: {
                                    iss: 'https://example.org/issuer',
                                    nested_field: {
                                        more_nested_field: { a: [1, 2, 3, 4] }
                                    }
                                }
                            },
                            {
                                signer: () => new Uint8Array(32).fill(41),
                                saltGenerator: () => 'salt',
                                disclosureFrame: {
                                    iss: true,
                                    __decoyCount: 1,
                                    nested_field: {
                                        more_nested_field: true,
                                        __decoyCount: 5
                                    }
                                },
                                hasherAndAlgorithm: {
                                    hasher: () => Buffer.from('hash'),
                                    algorithm: src_1.HasherAlgorithm.Sha256
                                }
                            }
                        )
                        ;(0, node_assert_1.strictEqual)(
                            yield sdJwt.toCompact(),
                            'eyJhbGciOiAiRWREU0EifQ.eyJuZXN0ZWRfZmllbGQiOiB7Il9zZCI6IFsiYUdGemFBIiwgImFHRnphQSIsICJhR0Z6YUEiLCAiYUdGemFBIiwgImFHRnphQSIsICJhR0Z6YUEiXX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbImFHRnphQSIsICJhR0Z6YUEiXX0.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~WyJzYWx0IiwgIm1vcmVfbmVzdGVkX2ZpZWxkIiwgeyJhIjogWzEsMiwzLDRdfV0~'
                        )
                    })
                )
                ;(0, node_test_1.it)('Roundtrip compact format sd-jwt', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const compact =
                            'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAibmVzdGVkX2ZpZWxkIjogeyJtb3JlX25lc3RlZF9maWVsZCI6IHsiYSI6IFsiMSIsIDIsMyw0XX19LCJfc2QiOiBbImhhc2giLCAiaGFzaCJdfQ.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~WyJzYWx0IiwgIm1vcmVfbmVzdGVkX2ZpZWxkIiwgeyJhIjogWyIxIiwgMiwzLDRdfV0~'
                        const sdJwt = src_1.SdJwt.fromCompact(compact)
                            .withHasher({
                                hasher: () => Buffer.from('hash'),
                                algorithm: src_1.HasherAlgorithm.Sha256
                            })
                            .withSigner(() => new Uint8Array(32).fill(41))
                            .withSaltGenerator(() => 'salt')
                        ;(0, node_assert_1.strictEqual)(
                            yield sdJwt.toCompact(),
                            compact
                        )
                    })
                )
                ;(0, node_test_1.it)(
                    'Specification: A.4.  Example 4b - W3C Verifiable Credentials Data Model v2.0 - 01',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            var _c
                            const compact =
                                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLmNvbS9pc3N1ZXIiLCAiaWF0IjogMTY4MzAwMDAwMCwgImV4cCI6IDE4ODMwMDAwMDAsICJAY29udGV4dCI6IFsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCAiaHR0cHM6Ly93M2lkLm9yZy92YWNjaW5hdGlvbi92MSJdLCAidHlwZSI6IFsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCAiVmFjY2luYXRpb25DZXJ0aWZpY2F0ZSJdLCAiaXNzdWVyIjogImh0dHBzOi8vZXhhbXBsZS5jb20vaXNzdWVyIiwgImlzc3VhbmNlRGF0ZSI6ICIyMDIzLTAyLTA5VDExOjAxOjU5WiIsICJleHBpcmF0aW9uRGF0ZSI6ICIyMDI4LTAyLTA4VDExOjAxOjU5WiIsICJuYW1lIjogIkNPVklELTE5IFZhY2NpbmF0aW9uIENlcnRpZmljYXRlIiwgImRlc2NyaXB0aW9uIjogIkNPVklELTE5IFZhY2NpbmF0aW9uIENlcnRpZmljYXRlIiwgImNyZWRlbnRpYWxTdWJqZWN0IjogeyJfc2QiOiBbIjFWX0stOGxEUThpRlhCRlhiWlk5ZWhxUjRIYWJXQ2k1VDB5Ykl6WlBld3ciLCAiSnpqTGd0UDI5ZFAtQjN0ZDEyUDY3NGdGbUsyenk4MUhNdEJnZjZDSk5XZyIsICJSMmZHYmZBMDdaX1lsa3FtTlp5bWExeHl5eDFYc3RJaVM2QjFZYmwySlo0IiwgIlRDbXpybDdLMmdldl9kdTdwY01JeXpSTEhwLVllZy1GbF9jeHRyVXZQeGciLCAiVjdrSkJMSzc4VG1WRE9tcmZKN1p1VVBIdUtfMmNjN3laUmE0cVYxdHh3TSIsICJiMGVVc3ZHUC1PRERkRm9ZNE5semxYYzN0RHNsV0p0Q0pGNzVOdzhPal9nIiwgInpKS19lU01YandNOGRYbU1aTG5JOEZHTTA4ekozX3ViR2VFTUotNVRCeTAiXSwgInZhY2NpbmUiOiB7Il9zZCI6IFsiMWNGNWhMd2toTU5JYXFmV0pyWEk3Tk1XZWRMLTlmNlkyUEE1MnlQalNaSSIsICJIaXk2V1d1ZUxENWJuMTYyOTh0UHY3R1hobWxkTURPVG5CaS1DWmJwaE5vIiwgIkxiMDI3cTY5MWpYWGwtakM3M3ZpOGViT2o5c214M0MtX29nN2dBNFRCUUUiXSwgInR5cGUiOiAiVmFjY2luZSJ9LCAicmVjaXBpZW50IjogeyJfc2QiOiBbIjFsU1FCTlkyNHEwVGg2T0d6dGhxLTctNGw2Y0FheHJZWE9HWnBlV19sbkEiLCAiM256THE4MU0yb04wNndkdjFzaEh2T0VKVnhaNUtMbWREa0hFREpBQldFSSIsICJQbjFzV2kwNkc0TEpybm4tX1JUMFJiTV9IVGR4blBKUXVYMmZ6V3ZfSk9VIiwgImxGOXV6ZHN3N0hwbEdMYzcxNFRyNFdPN01HSnphN3R0N1FGbGVDWDRJdHciXSwgInR5cGUiOiAiVmFjY2luZVJlY2lwaWVudCJ9LCAidHlwZSI6ICJWYWNjaW5hdGlvbkV2ZW50In0sICJfc2RfYWxnIjogInNoYS0yNTYifQ.5jJEqiRViN_DJ4VMxHQIN4KK-Cdfn30nY3nRe5jGxS5Pths5G7mF1GWy9TawYuyFwCze7qiCIx_MhJ68Uu5zeQ~WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImF0Y0NvZGUiLCAiSjA3QlgwMyJd~WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgIm1lZGljaW5hbFByb2R1Y3ROYW1lIiwgIkNPVklELTE5IFZhY2NpbmUgTW9kZXJuYSJd~WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgIm1hcmtldGluZ0F1dGhvcml6YXRpb25Ib2xkZXIiLCAiTW9kZXJuYSBCaW90ZWNoIl0~WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgIm5leHRWYWNjaW5hdGlvbkRhdGUiLCAiMjAyMS0wOC0xNlQxMzo0MDoxMloiXQ~WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgImNvdW50cnlPZlZhY2NpbmF0aW9uIiwgIkdFIl0~WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRhdGVPZlZhY2NpbmF0aW9uIiwgIjIwMjEtMDYtMjNUMTM6NDA6MTJaIl0~WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgIm9yZGVyIiwgIjMvMyJd~WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgImdlbmRlciIsICJGZW1hbGUiXQ~WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgImJpcnRoRGF0ZSIsICIxOTYxLTA4LTE3Il0~WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgImdpdmVuTmFtZSIsICJNYXJpb24iXQ~WyI1YlBzMUlxdVpOYTBoa2FGenp6Wk53IiwgImZhbWlseU5hbWUiLCAiTXVzdGVybWFubiJd~WyI1YTJXMF9OcmxFWnpmcW1rXzdQcS13IiwgImFkbWluaXN0ZXJpbmdDZW50cmUiLCAiUHJheGlzIFNvbW1lcmdhcnRlbiJd~WyJ5MXNWVTV3ZGZKYWhWZGd3UGdTN1JRIiwgImJhdGNoTnVtYmVyIiwgIjE2MjYzODI3MzYiXQ~WyJIYlE0WDhzclZXM1FEeG5JSmRxeU9BIiwgImhlYWx0aFByb2Zlc3Npb25hbCIsICI4ODMxMTAwMDAwMTUzNzYiXQ~'
                            const sdJwt = src_1.SdJwt.fromCompact(compact)
                            ;(0, node_assert_1.deepStrictEqual)(sdJwt.header, {
                                alg: 'ES256'
                            })
                            ;(0, node_assert_1.deepStrictEqual)(sdJwt.payload, {
                                iss: 'https://example.com/issuer',
                                iat: 1683000000,
                                exp: 1883000000,
                                '@context': [
                                    'https://www.w3.org/2018/credentials/v1',
                                    'https://w3id.org/vaccination/v1'
                                ],
                                type: [
                                    'VerifiableCredential',
                                    'VaccinationCertificate'
                                ],
                                issuer: 'https://example.com/issuer',
                                issuanceDate: '2023-02-09T11:01:59Z',
                                expirationDate: '2028-02-08T11:01:59Z',
                                name: 'COVID-19 Vaccination Certificate',
                                description: 'COVID-19 Vaccination Certificate',
                                _sd_alg: 'sha-256',
                                credentialSubject: {
                                    _sd: [
                                        '1V_K-8lDQ8iFXBFXbZY9ehqR4HabWCi5T0ybIzZPeww',
                                        'JzjLgtP29dP-B3td12P674gFmK2zy81HMtBgf6CJNWg',
                                        'R2fGbfA07Z_YlkqmNZyma1xyyx1XstIiS6B1Ybl2JZ4',
                                        'TCmzrl7K2gev_du7pcMIyzRLHp-Yeg-Fl_cxtrUvPxg',
                                        'V7kJBLK78TmVDOmrfJ7ZuUPHuK_2cc7yZRa4qV1txwM',
                                        'b0eUsvGP-ODDdFoY4NlzlXc3tDslWJtCJF75Nw8Oj_g',
                                        'zJK_eSMXjwM8dXmMZLnI8FGM08zJ3_ubGeEMJ-5TBy0'
                                    ],
                                    recipient: {
                                        _sd: [
                                            '1lSQBNY24q0Th6OGzthq-7-4l6cAaxrYXOGZpeW_lnA',
                                            '3nzLq81M2oN06wdv1shHvOEJVxZ5KLmdDkHEDJABWEI',
                                            'Pn1sWi06G4LJrnn-_RT0RbM_HTdxnPJQuX2fzWv_JOU',
                                            'lF9uzdsw7HplGLc714Tr4WO7MGJza7tt7QFleCX4Itw'
                                        ],
                                        type: 'VaccineRecipient'
                                    },
                                    type: 'VaccinationEvent',
                                    vaccine: {
                                        _sd: [
                                            '1cF5hLwkhMNIaqfWJrXI7NMWedL-9f6Y2PA52yPjSZI',
                                            'Hiy6WWueLD5bn16298tPv7GXhmldMDOTnBi-CZbphNo',
                                            'Lb027q691jXXl-jC73vi8ebOj9smx3C-_og7gA4TBQE'
                                        ],
                                        type: 'Vaccine'
                                    }
                                }
                            })
                            ;(0, node_assert_1.deepStrictEqual)(
                                (_c = sdJwt.disclosures) === null ||
                                    _c === void 0
                                    ? void 0
                                    : _c.map((d) => d.toString()),
                                [
                                    'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImF0Y0NvZGUiLCAiSjA3QlgwMyJd',
                                    'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgIm1lZGljaW5hbFByb2R1Y3ROYW1lIiwgIkNPVklELTE5IFZhY2NpbmUgTW9kZXJuYSJd',
                                    'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgIm1hcmtldGluZ0F1dGhvcml6YXRpb25Ib2xkZXIiLCAiTW9kZXJuYSBCaW90ZWNoIl0',
                                    'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgIm5leHRWYWNjaW5hdGlvbkRhdGUiLCAiMjAyMS0wOC0xNlQxMzo0MDoxMloiXQ',
                                    'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgImNvdW50cnlPZlZhY2NpbmF0aW9uIiwgIkdFIl0',
                                    'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRhdGVPZlZhY2NpbmF0aW9uIiwgIjIwMjEtMDYtMjNUMTM6NDA6MTJaIl0',
                                    'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgIm9yZGVyIiwgIjMvMyJd',
                                    'WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgImdlbmRlciIsICJGZW1hbGUiXQ',
                                    'WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgImJpcnRoRGF0ZSIsICIxOTYxLTA4LTE3Il0',
                                    'WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgImdpdmVuTmFtZSIsICJNYXJpb24iXQ',
                                    'WyI1YlBzMUlxdVpOYTBoa2FGenp6Wk53IiwgImZhbWlseU5hbWUiLCAiTXVzdGVybWFubiJd',
                                    'WyI1YTJXMF9OcmxFWnpmcW1rXzdQcS13IiwgImFkbWluaXN0ZXJpbmdDZW50cmUiLCAiUHJheGlzIFNvbW1lcmdhcnRlbiJd',
                                    'WyJ5MXNWVTV3ZGZKYWhWZGd3UGdTN1JRIiwgImJhdGNoTnVtYmVyIiwgIjE2MjYzODI3MzYiXQ',
                                    'WyJIYlE0WDhzclZXM1FEeG5JSmRxeU9BIiwgImhlYWx0aFByb2Zlc3Npb25hbCIsICI4ODMxMTAwMDAwMTUzNzYiXQ'
                                ]
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'Specification: A.4.  Example 4b - W3C Verifiable Credentials Data Model v2.0 - 02',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            var _d
                            const compact =
                                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLmNvbS9pc3N1ZXIiLCAiaWF0IjogMTY4MzAwMDAwMCwgImV4cCI6IDE4ODMwMDAwMDAsICJAY29udGV4dCI6IFsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCAiaHR0cHM6Ly93M2lkLm9yZy92YWNjaW5hdGlvbi92MSJdLCAidHlwZSI6IFsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCAiVmFjY2luYXRpb25DZXJ0aWZpY2F0ZSJdLCAiaXNzdWVyIjogImh0dHBzOi8vZXhhbXBsZS5jb20vaXNzdWVyIiwgImlzc3VhbmNlRGF0ZSI6ICIyMDIzLTAyLTA5VDExOjAxOjU5WiIsICJleHBpcmF0aW9uRGF0ZSI6ICIyMDI4LTAyLTA4VDExOjAxOjU5WiIsICJuYW1lIjogIkNPVklELTE5IFZhY2NpbmF0aW9uIENlcnRpZmljYXRlIiwgImRlc2NyaXB0aW9uIjogIkNPVklELTE5IFZhY2NpbmF0aW9uIENlcnRpZmljYXRlIiwgImNyZWRlbnRpYWxTdWJqZWN0IjogeyJfc2QiOiBbIjFWX0stOGxEUThpRlhCRlhiWlk5ZWhxUjRIYWJXQ2k1VDB5Ykl6WlBld3ciLCAiSnpqTGd0UDI5ZFAtQjN0ZDEyUDY3NGdGbUsyenk4MUhNdEJnZjZDSk5XZyIsICJSMmZHYmZBMDdaX1lsa3FtTlp5bWExeHl5eDFYc3RJaVM2QjFZYmwySlo0IiwgIlRDbXpybDdLMmdldl9kdTdwY01JeXpSTEhwLVllZy1GbF9jeHRyVXZQeGciLCAiVjdrSkJMSzc4VG1WRE9tcmZKN1p1VVBIdUtfMmNjN3laUmE0cVYxdHh3TSIsICJiMGVVc3ZHUC1PRERkRm9ZNE5semxYYzN0RHNsV0p0Q0pGNzVOdzhPal9nIiwgInpKS19lU01YandNOGRYbU1aTG5JOEZHTTA4ekozX3ViR2VFTUotNVRCeTAiXSwgInZhY2NpbmUiOiB7Il9zZCI6IFsiMWNGNWhMd2toTU5JYXFmV0pyWEk3Tk1XZWRMLTlmNlkyUEE1MnlQalNaSSIsICJIaXk2V1d1ZUxENWJuMTYyOTh0UHY3R1hobWxkTURPVG5CaS1DWmJwaE5vIiwgIkxiMDI3cTY5MWpYWGwtakM3M3ZpOGViT2o5c214M0MtX29nN2dBNFRCUUUiXSwgInR5cGUiOiAiVmFjY2luZSJ9LCAicmVjaXBpZW50IjogeyJfc2QiOiBbIjFsU1FCTlkyNHEwVGg2T0d6dGhxLTctNGw2Y0FheHJZWE9HWnBlV19sbkEiLCAiM256THE4MU0yb04wNndkdjFzaEh2T0VKVnhaNUtMbWREa0hFREpBQldFSSIsICJQbjFzV2kwNkc0TEpybm4tX1JUMFJiTV9IVGR4blBKUXVYMmZ6V3ZfSk9VIiwgImxGOXV6ZHN3N0hwbEdMYzcxNFRyNFdPN01HSnphN3R0N1FGbGVDWDRJdHciXSwgInR5cGUiOiAiVmFjY2luZVJlY2lwaWVudCJ9LCAidHlwZSI6ICJWYWNjaW5hdGlvbkV2ZW50In0sICJfc2RfYWxnIjogInNoYS0yNTYifQ.5jJEqiRViN_DJ4VMxHQIN4KK-Cdfn30nY3nRe5jGxS5Pths5G7mF1GWy9TawYuyFwCze7qiCIx_MhJ68Uu5zeQ~WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgIm9yZGVyIiwgIjMvMyJd~WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRhdGVPZlZhY2NpbmF0aW9uIiwgIjIwMjEtMDYtMjNUMTM6NDA6MTJaIl0~WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImF0Y0NvZGUiLCAiSjA3QlgwMyJd~WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgIm1lZGljaW5hbFByb2R1Y3ROYW1lIiwgIkNPVklELTE5IFZhY2NpbmUgTW9kZXJuYSJd~'
                            const sdJwt = src_1.SdJwt.fromCompact(compact)
                            ;(0, node_assert_1.deepStrictEqual)(sdJwt.header, {
                                alg: 'ES256'
                            })
                            ;(0, node_assert_1.deepStrictEqual)(sdJwt.payload, {
                                iss: 'https://example.com/issuer',
                                iat: 1683000000,
                                exp: 1883000000,
                                '@context': [
                                    'https://www.w3.org/2018/credentials/v1',
                                    'https://w3id.org/vaccination/v1'
                                ],
                                type: [
                                    'VerifiableCredential',
                                    'VaccinationCertificate'
                                ],
                                issuer: 'https://example.com/issuer',
                                issuanceDate: '2023-02-09T11:01:59Z',
                                expirationDate: '2028-02-08T11:01:59Z',
                                name: 'COVID-19 Vaccination Certificate',
                                description: 'COVID-19 Vaccination Certificate',
                                credentialSubject: {
                                    _sd: [
                                        '1V_K-8lDQ8iFXBFXbZY9ehqR4HabWCi5T0ybIzZPeww',
                                        'JzjLgtP29dP-B3td12P674gFmK2zy81HMtBgf6CJNWg',
                                        'R2fGbfA07Z_YlkqmNZyma1xyyx1XstIiS6B1Ybl2JZ4',
                                        'TCmzrl7K2gev_du7pcMIyzRLHp-Yeg-Fl_cxtrUvPxg',
                                        'V7kJBLK78TmVDOmrfJ7ZuUPHuK_2cc7yZRa4qV1txwM',
                                        'b0eUsvGP-ODDdFoY4NlzlXc3tDslWJtCJF75Nw8Oj_g',
                                        'zJK_eSMXjwM8dXmMZLnI8FGM08zJ3_ubGeEMJ-5TBy0'
                                    ],
                                    vaccine: {
                                        _sd: [
                                            '1cF5hLwkhMNIaqfWJrXI7NMWedL-9f6Y2PA52yPjSZI',
                                            'Hiy6WWueLD5bn16298tPv7GXhmldMDOTnBi-CZbphNo',
                                            'Lb027q691jXXl-jC73vi8ebOj9smx3C-_og7gA4TBQE'
                                        ],
                                        type: 'Vaccine'
                                    },
                                    recipient: {
                                        _sd: [
                                            '1lSQBNY24q0Th6OGzthq-7-4l6cAaxrYXOGZpeW_lnA',
                                            '3nzLq81M2oN06wdv1shHvOEJVxZ5KLmdDkHEDJABWEI',
                                            'Pn1sWi06G4LJrnn-_RT0RbM_HTdxnPJQuX2fzWv_JOU',
                                            'lF9uzdsw7HplGLc714Tr4WO7MGJza7tt7QFleCX4Itw'
                                        ],
                                        type: 'VaccineRecipient'
                                    },
                                    type: 'VaccinationEvent'
                                },
                                _sd_alg: 'sha-256'
                            })
                            ;(0, node_assert_1.deepStrictEqual)(
                                (_d = sdJwt.disclosures) === null ||
                                    _d === void 0
                                    ? void 0
                                    : _d.map((d) => d.toString()),
                                [
                                    'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgIm9yZGVyIiwgIjMvMyJd',
                                    'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRhdGVPZlZhY2NpbmF0aW9uIiwgIjIwMjEtMDYtMjNUMTM6NDA6MTJaIl0',
                                    'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImF0Y0NvZGUiLCAiSjA3QlgwMyJd',
                                    'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgIm1lZGljaW5hbFByb2R1Y3ROYW1lIiwgIkNPVklELTE5IFZhY2NpbmUgTW9kZXJuYSJd'
                                ]
                            )
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('pretty claims', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'extract the pretty claims from a sd-jwt',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt(
                                {
                                    header: { alg: 'EdDSA' },
                                    payload: {
                                        iss: 'https://example.org/issuer',
                                        aud: 'https://example.org/audience',
                                        sub: 'https://example.org/subject',
                                        age_over_21: true,
                                        age_over_24: true,
                                        age_over_65: false
                                    }
                                },
                                {
                                    hasherAndAlgorithm:
                                        utils_1.hasherAndAlgorithm,
                                    signer: utils_1.signer,
                                    saltGenerator: utils_1.saltGenerator,
                                    disclosureFrame: {
                                        age_over_65: true,
                                        age_over_24: true,
                                        age_over_21: true,
                                        __decoyCount: 2
                                    }
                                }
                            )
                            yield sdJwt.applyDisclosureFrame()
                            const prettyClaims = yield sdJwt.getPrettyClaims()
                            ;(0, node_assert_1.deepStrictEqual)(prettyClaims, {
                                iss: 'https://example.org/issuer',
                                aud: 'https://example.org/audience',
                                sub: 'https://example.org/subject',
                                age_over_21: true,
                                age_over_24: true,
                                age_over_65: false
                            })
                        })
                )
                ;(0, node_test_1.it)(
                    'extract the pretty claims from a sd-jwt after presentation',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt(
                                {
                                    header: { alg: 'EdDSA' },
                                    payload: {
                                        iss: 'https://example.org/issuer',
                                        aud: 'https://example.org/audience',
                                        sub: 'https://example.org/subject',
                                        age_over_21: true,
                                        age_over_24: true,
                                        age_over_65: false
                                    }
                                },
                                {
                                    hasherAndAlgorithm:
                                        utils_1.hasherAndAlgorithm,
                                    signer: utils_1.signer,
                                    saltGenerator: utils_1.saltGenerator,
                                    disclosureFrame: {
                                        age_over_65: true,
                                        age_over_24: true,
                                        age_over_21: true,
                                        __decoyCount: 2
                                    }
                                }
                            )
                            const presentation = yield sdJwt.present({
                                age_over_24: true
                            })
                            const sdJwtFromCompact = src_1.SdJwt.fromCompact(
                                presentation
                            ).withHasher(utils_1.hasherAndAlgorithm)
                            const prettyClaims =
                                yield sdJwtFromCompact.getPrettyClaims()
                            ;(0, node_assert_1.deepStrictEqual)(prettyClaims, {
                                iss: 'https://example.org/issuer',
                                aud: 'https://example.org/audience',
                                sub: 'https://example.org/subject',
                                age_over_24: true
                            })
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('verification', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'verify that the correct hash is being used',
                    () => __awaiter(void 0, void 0, void 0, function* () {})
                )
                ;(0, node_test_1.it)(
                    'verify simple sd-jwt without disclosures',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!' }
                            })
                                .withSigner(utils_1.signer)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const { isValid, isSignatureValid } =
                                yield sdJwtFromCompact.verify(utils_1.verifier)
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'verify simple sd-jwt with a disclosure',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!', discloseMe: 'please' }
                            })
                                .withDisclosureFrame({ discloseMe: true })
                                .withSigner(utils_1.signer)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const { isValid, isSignatureValid } =
                                yield sdJwtFromCompact.verify(utils_1.verifier)
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'verify simple sd-jwt with a disclosure and key binding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const keyBinding = new src_1.KeyBinding(
                                {
                                    header: {
                                        typ: 'kb+jwt',
                                        alg: src_1
                                            .SignatureAndEncryptionAlgorithm
                                            .EdDSA
                                    },
                                    payload: {
                                        iat: new Date().getTime() / 1000,
                                        aud: 'did:peer:4:some-verifier',
                                        nonce: yield (0,
                                        utils_1.saltGenerator)()
                                    }
                                },
                                { signer: utils_1.signer }
                            )
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!', discloseMe: 'please' }
                            })
                                .withKeyBinding(keyBinding)
                                .withDisclosureFrame({ discloseMe: true })
                                .withSigner(utils_1.signer)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const {
                                isValid,
                                isSignatureValid,
                                isKeyBindingValid
                            } = yield sdJwtFromCompact.verify(utils_1.verifier)
                            ;(0, node_assert_1.default)(isKeyBindingValid)
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'verify simple sd-jwt with required disclosures',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!', discloseMe: 'please' }
                            })
                                .withDisclosureFrame({ discloseMe: true })
                                .withSigner(utils_1.signer)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const {
                                isValid,
                                isSignatureValid,
                                areRequiredClaimsIncluded
                            } = yield sdJwtFromCompact.verify(
                                utils_1.verifier,
                                ['sign', 'discloseMe']
                            )
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(
                                areRequiredClaimsIncluded
                            )
                            ;(0, node_assert_1.default)(isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'verify simple sd-jwt with required nested disclosures',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: {
                                    sign: 'me!!',
                                    discloseMe: 'please',
                                    a: { b: 123 }
                                }
                            })
                                .withDisclosureFrame({
                                    discloseMe: true,
                                    a: { b: true }
                                })
                                .withSigner(utils_1.signer)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const {
                                isValid,
                                isSignatureValid,
                                areRequiredClaimsIncluded
                            } = yield sdJwtFromCompact.verify(
                                utils_1.verifier,
                                ['sign', 'discloseMe', 'b']
                            )
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(
                                areRequiredClaimsIncluded
                            )
                            ;(0, node_assert_1.default)(isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'verify simple sd-jwt with more than required nested disclosures',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: {
                                    sign: 'me!!',
                                    discloseMe: 'please',
                                    a: { b: 123 }
                                }
                            })
                                .withDisclosureFrame({
                                    discloseMe: true,
                                    a: { b: true }
                                })
                                .withSigner(utils_1.signer)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const {
                                isValid,
                                isSignatureValid,
                                areRequiredClaimsIncluded
                            } = yield sdJwtFromCompact.verify(
                                utils_1.verifier,
                                ['sign', 'discloseMe']
                            )
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(
                                areRequiredClaimsIncluded
                            )
                            ;(0, node_assert_1.default)(isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'decline simple sd-jwt with disclosed items not included',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: {
                                    sign: 'me!!',
                                    discloseMe: 'please',
                                    a: { b: 123 }
                                }
                            })
                                .withDisclosureFrame({ discloseMe: true })
                                .withSigner(utils_1.signer)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const {
                                isValid,
                                isSignatureValid,
                                areRequiredClaimsIncluded
                            } = yield sdJwtFromCompact.verify(
                                utils_1.verifier,
                                ['sign', 'discloseMe', 'notIncludedItem']
                            )
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(
                                !areRequiredClaimsIncluded
                            )
                            ;(0, node_assert_1.default)(!isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'decline simple sd-jwt with cleartext claim items not included',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: {
                                    sign: 'me!!',
                                    discloseMe: 'please',
                                    a: { b: 123 }
                                }
                            })
                                .withDisclosureFrame({ discloseMe: true })
                                .withSigner(utils_1.signer)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const {
                                isValid,
                                isSignatureValid,
                                areRequiredClaimsIncluded
                            } = yield sdJwtFromCompact.verify(
                                utils_1.verifier,
                                [
                                    'sign',
                                    'notIncludedInClearTextKey',
                                    'discloseMe'
                                ]
                            )
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(
                                !areRequiredClaimsIncluded
                            )
                            ;(0, node_assert_1.default)(!isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'decline simple sd-jwt where everything is invalid',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: {
                                    sign: 'me!!',
                                    discloseMe: 'please',
                                    a: { b: 123 }
                                }
                            })
                                .withDisclosureFrame({ discloseMe: true })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const {
                                isValid,
                                isSignatureValid,
                                areRequiredClaimsIncluded
                            } = yield sdJwtFromCompact.verify(
                                utils_1.verifier,
                                [
                                    'sign',
                                    'notIncludedInClearTextKey',
                                    'discloseMe',
                                    'notIncludedDisclosure'
                                ]
                            )
                            ;(0, node_assert_1.default)(!isSignatureValid)
                            ;(0, node_assert_1.default)(
                                !areRequiredClaimsIncluded
                            )
                            ;(0, node_assert_1.default)(!isValid)
                        })
                )
                ;(0, node_test_1.it)(
                    'accept simple sd-jwt where required key can be a disclosure or payload',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!', discloseMe: 'please' }
                            })
                                .withSigner(utils_1.signer)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const compact = yield sdJwt.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                typeof compact,
                                'string'
                            )
                            const sdJwtFromCompact =
                                src_1.SdJwt.fromCompact(compact)
                            const {
                                isValid,
                                isSignatureValid,
                                areRequiredClaimsIncluded
                            } = yield sdJwtFromCompact.verify(
                                utils_1.verifier,
                                ['sign', 'discloseMe']
                            )
                            ;(0, node_assert_1.default)(isSignatureValid)
                            ;(0, node_assert_1.default)(
                                areRequiredClaimsIncluded
                            )
                            ;(0, node_assert_1.default)(isValid)
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('present', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'create a presentation of all selectively disclosable items',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!', discloseMe: 'please' }
                            })
                                .withDisclosureFrame({
                                    sign: true,
                                    discloseMe: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withSaltGenerator(() => 'salt')
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const presentation = yield sdJwt.present()
                            ;(0, node_assert_1.strictEqual)(
                                presentation,
                                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJJVlVxckNOcGl4SGxyYlo2S2JrNUxtcTFIdUcxS2Z2UXVZSkNONk9sTjNNIiwgIm9jTDJOTXhwVTBWR240clptbVFaUFZObU1RNTVsZlFTMlBmMkh1Y2s5amMiXX0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgInNpZ24iLCAibWUhISJd~WyJzYWx0IiwgImRpc2Nsb3NlTWUiLCAicGxlYXNlIl0~'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'create a presentation with some of the selectively disclosable items',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!', discloseMe: 'please' }
                            })
                                .withDisclosureFrame({
                                    sign: true,
                                    discloseMe: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withSaltGenerator(() => 'salt')
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const presentation = yield sdJwt.present({
                                sign: true
                            })
                            ;(0, node_assert_1.strictEqual)(
                                presentation,
                                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJJVlVxckNOcGl4SGxyYlo2S2JrNUxtcTFIdUcxS2Z2UXVZSkNONk9sTjNNIiwgIm9jTDJOTXhwVTBWR240clptbVFaUFZObU1RNTVsZlFTMlBmMkh1Y2s5amMiXX0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgInNpZ24iLCAibWUhISJd~'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'create a presentation with none of the selectively disclosable items',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!', discloseMe: 'please' }
                            })
                                .withDisclosureFrame({
                                    sign: true,
                                    discloseMe: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withSaltGenerator(() => 'salt')
                                .withHasher(utils_1.hasherAndAlgorithm)
                            const presentation = yield sdJwt.present({})
                            ;(0, node_assert_1.strictEqual)(
                                presentation,
                                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJJVlVxckNOcGl4SGxyYlo2S2JrNUxtcTFIdUcxS2Z2UXVZSkNONk9sTjNNIiwgIm9jTDJOTXhwVTBWR240clptbVFaUFZObU1RNTVsZlFTMlBmMkh1Y2s5amMiXX0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when the presenation frame contains other values than object, array or boolean',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!', discloseMe: 'please' }
                            })
                                .withDisclosureFrame({
                                    sign: true,
                                    discloseMe: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withSaltGenerator(() => 'salt')
                                .withHasher(utils_1.hasherAndAlgorithm)
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwt.present({
                                                name: 'string'
                                            })
                                        }
                                    ),
                                src_1.SdJwtError
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when the presenation frame does not match the structure of the sd-jwt payload',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwt = new src_1.SdJwt({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: { sign: 'me!!', discloseMe: 'please' }
                            })
                                .withDisclosureFrame({
                                    sign: true,
                                    discloseMe: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withSaltGenerator(() => 'salt')
                                .withHasher(utils_1.hasherAndAlgorithm)
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwt.present({
                                                name: true
                                            })
                                        }
                                    ),
                                src_1.SdJwtError
                            )
                        })
                )
            })
        )
    })
)
//# sourceMappingURL=sdJwt.test.js.map
