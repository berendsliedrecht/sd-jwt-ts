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
const node_crypto_1 = require('node:crypto')
const node_assert_1 = __importStar(require('node:assert'))
const utils_1 = require('./utils')
const src_1 = require('../src')
;(0, node_test_1.describe)('sd-jwt-vc', () =>
    __awaiter(void 0, void 0, void 0, function* () {
        ;(0, node_test_1.before)(utils_1.prelude)
        ;(0, node_test_1.describe)('create sd-jwt-vc', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('create a simple sd-jwt-vc', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const cnf = utils_1.publicHolderKeyJwk
                        const sdJwtVc = new src_1.SdJwtVc({
                            header: {
                                alg: src_1.SignatureAndEncryptionAlgorithm
                                    .EdDSA,
                                typ: 'vc+sd-jwt'
                            },
                            payload: {
                                vct: 'IdentityCredential',
                                iss: 'https://example.org/issuer',
                                iat: 1698056110,
                                cnf,
                                given_name: 'John',
                                family_name: 'Doe',
                                email: 'johndoe@example.com',
                                phone_number: '+1-202-555-0101',
                                address: {
                                    street_address: '123 Main St',
                                    locality: 'Anytown',
                                    region: 'Anystate',
                                    country: 'US'
                                },
                                birthdate: '1940-01-01',
                                is_over_18: true,
                                is_over_21: true,
                                is_over_65: true
                            }
                        })
                            .withDisclosureFrame({
                                is_over_65: true,
                                is_over_21: true,
                                is_over_18: true,
                                birthdate: true,
                                email: true,
                                address: true,
                                given_name: true,
                                family_name: true,
                                phone_number: true
                            })
                            .withSigner(() => new Uint8Array(32).fill(42))
                            .withHasher({
                                hasher: Buffer.from,
                                algorithm: src_1.HasherAlgorithm.Sha256
                            })
                            .withSaltGenerator(() => 'salt')
                        const compact = yield sdJwtVc.toCompact()
                        ;(0, node_assert_1.strictEqual)(
                            compact,
                            'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ2Y3QiOiAiSWRlbnRpdHlDcmVkZW50aWFsIiwgImlzcyI6ICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciIsICJpYXQiOiAxNjk4MDU2MTEwLCJjbmYiOiB7Imp3ayI6IHsiY3J2IjogIkVkMjU1MTkiLCAia3R5IjogIk9LUCIsICJ4IjogIkNpclpuLVY5bl9LUmg4YzJJeVdxT3RyVm05d2x6YVZERFM4WTR6R21Rc28ifX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbIlYzbEtlbGxYZURCSmFYZG5TVzFHYTFwSVNteGpNMDFwVEVOQ04wbHVUakJqYlZac1pFWTVhRnBIVW5sYVdFNTZTV3B2WjBscVJYbE5lVUpPV1Zkc2RVbEdUakJKYVhkblNXMTRkbGt5Um5OaFdGSTFTV3B2WjBsclJuVmxXRkoyWkRJMGFVeERRV2xqYlZadVlWYzVkVWxxYjJkSmEwWjFaVmhPTUZsWVVteEphWGRuU1cxT2RtUlhOVEJqYm10cFQybEJhVlpXVFdsbVZqQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxS2NHTnVVbTlhUjBZd1dsTkpjMGxEU1hoUFZGRjNURlJCZUV4VVFYaEpiREEiLCAiVjNsS2VsbFhlREJKYVhkblNXMVdkRmxYYkhOSmFYZG5TVzF3ZG1GSE5XdGlNbFpCV2xob2FHSllRbk5hVXpWcVlqSXdhVmhSIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFhYUdKWGJITmxWamwxV1ZjeGJFbHBkMmRKYTFKMldsTktaQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxa2NHUnRWblZZTWpWb1lsZFZhVXhEUVdsVGJUbHZZbWxLWkEiLCAiVjNsS2VsbFhlREJKYVhkblNXMXNlbGd5T1RKYVdFcG1UVlJuYVV4RFFqQmpibFpzV0ZFIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFzZWxneU9USmFXRXBtVFdwRmFVeERRakJqYmxac1dGRSIsICJWM2xLZWxsWGVEQkphWGRuU1cxc2VsZ3lPVEphV0VwbVRtcFZhVXhEUWpCamJsWnNXRkUiLCAiVjNsS2VsbFhlREJKYVhkblNXNUNiMkl5Tld4WU1qVXhZbGRLYkdOcFNYTkpRMGx5VFZNd2VVMUVTWFJPVkZVeFRGUkJlRTFFUldsWVVRIl19.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~'
                        )
                    })
                )
                ;(0, node_test_1.it)(
                    'create simple sd-jwt-vc with key binding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwtVc = src_1.SdJwtVc.fromCompact(
                                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ2Y3QiOiAiSWRlbnRpdHlDcmVkZW50aWFsIiwgImlzcyI6ICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciIsICJpYXQiOiAxNjk4MDU2MTEwLCJjbmYiOiB7Imp3ayI6IHsiY3J2IjogIkVkMjU1MTkiLCAia3R5IjogIk9LUCIsICJ4IjogIkNpclpuLVY5bl9LUmg4YzJJeVdxT3RyVm05d2x6YVZERFM4WTR6R21Rc28ifX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbIlYzbEtlbGxYZURCSmFYZG5TVzFHYTFwSVNteGpNMDFwVEVOQ04wbHVUakJqYlZac1pFWTVhRnBIVW5sYVdFNTZTV3B2WjBscVJYbE5lVUpPV1Zkc2RVbEdUakJKYVhkblNXMTRkbGt5Um5OaFdGSTFTV3B2WjBsclJuVmxXRkoyWkRJMGFVeERRV2xqYlZadVlWYzVkVWxxYjJkSmEwWjFaVmhPTUZsWVVteEphWGRuU1cxT2RtUlhOVEJqYm10cFQybEJhVlpXVFdsbVZqQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxS2NHTnVVbTlhUjBZd1dsTkpjMGxEU1hoUFZGRjNURlJCZUV4VVFYaEpiREEiLCAiVjNsS2VsbFhlREJKYVhkblNXMVdkRmxYYkhOSmFYZG5TVzF3ZG1GSE5XdGlNbFpCV2xob2FHSllRbk5hVXpWcVlqSXdhVmhSIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFhYUdKWGJITmxWamwxV1ZjeGJFbHBkMmRKYTFKMldsTktaQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxa2NHUnRWblZZTWpWb1lsZFZhVXhEUVdsVGJUbHZZbWxLWkEiLCAiVjNsS2VsbFhlREJKYVhkblNXMXNlbGd5T1RKYVdFcG1UVlJuYVV4RFFqQmpibFpzV0ZFIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFzZWxneU9USmFXRXBtVFdwRmFVeERRakJqYmxac1dGRSIsICJWM2xLZWxsWGVEQkphWGRuU1cxc2VsZ3lPVEphV0VwbVRtcFZhVXhEUWpCamJsWnNXRkUiLCAiVjNsS2VsbFhlREJKYVhkblNXNUNiMkl5Tld4WU1qVXhZbGRLYkdOcFNYTkpRMGx5VFZNd2VVMUVTWFJPVkZVeFRGUkJlRTFFUldsWVVRIl19.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~'
                            )
                            const keyBinding = new src_1.KeyBinding({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'kb+jwt'
                                },
                                payload: {
                                    aud: 'https://example.org/audience',
                                    iat: 1698056120,
                                    nonce: 'some-nonce'
                                }
                            }).withSigner(() => new Uint8Array(32).fill(42))
                            const sdJwtVcWithKeyBinding =
                                sdJwtVc.withKeyBinding(keyBinding)
                            const compact = yield sdJwtVc.toCompact()
                            const compactWithKeyBinding =
                                yield sdJwtVcWithKeyBinding.toCompact()
                            const compactKeyBinding =
                                yield keyBinding.toCompact()
                            ;(0, node_assert_1.strictEqual)(
                                compactWithKeyBinding,
                                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ2Y3QiOiAiSWRlbnRpdHlDcmVkZW50aWFsIiwgImlzcyI6ICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciIsICJpYXQiOiAxNjk4MDU2MTEwLCJjbmYiOiB7Imp3ayI6IHsiY3J2IjogIkVkMjU1MTkiLCAia3R5IjogIk9LUCIsICJ4IjogIkNpclpuLVY5bl9LUmg4YzJJeVdxT3RyVm05d2x6YVZERFM4WTR6R21Rc28ifX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbIlYzbEtlbGxYZURCSmFYZG5TVzFHYTFwSVNteGpNMDFwVEVOQ04wbHVUakJqYlZac1pFWTVhRnBIVW5sYVdFNTZTV3B2WjBscVJYbE5lVUpPV1Zkc2RVbEdUakJKYVhkblNXMTRkbGt5Um5OaFdGSTFTV3B2WjBsclJuVmxXRkoyWkRJMGFVeERRV2xqYlZadVlWYzVkVWxxYjJkSmEwWjFaVmhPTUZsWVVteEphWGRuU1cxT2RtUlhOVEJqYm10cFQybEJhVlpXVFdsbVZqQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxS2NHTnVVbTlhUjBZd1dsTkpjMGxEU1hoUFZGRjNURlJCZUV4VVFYaEpiREEiLCAiVjNsS2VsbFhlREJKYVhkblNXMVdkRmxYYkhOSmFYZG5TVzF3ZG1GSE5XdGlNbFpCV2xob2FHSllRbk5hVXpWcVlqSXdhVmhSIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFhYUdKWGJITmxWamwxV1ZjeGJFbHBkMmRKYTFKMldsTktaQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxa2NHUnRWblZZTWpWb1lsZFZhVXhEUVdsVGJUbHZZbWxLWkEiLCAiVjNsS2VsbFhlREJKYVhkblNXMXNlbGd5T1RKYVdFcG1UVlJuYVV4RFFqQmpibFpzV0ZFIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFzZWxneU9USmFXRXBtVFdwRmFVeERRakJqYmxac1dGRSIsICJWM2xLZWxsWGVEQkphWGRuU1cxc2VsZ3lPVEphV0VwbVRtcFZhVXhEUWpCamJsWnNXRkUiLCAiVjNsS2VsbFhlREJKYVhkblNXNUNiMkl5Tld4WU1qVXhZbGRLYkdOcFNYTkpRMGx5VFZNd2VVMUVTWFJPVkZVeFRGUkJlRTFFUldsWVVRIl19.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~eyJhbGciOiAiRWREU0EiLCAidHlwIjogImtiK2p3dCJ9.eyJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSIsICJpYXQiOiAxNjk4MDU2MTIwLCJub25jZSI6ICJzb21lLW5vbmNlIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
                            )
                            ;(0, node_assert_1.default)(
                                compactWithKeyBinding.endsWith(
                                    compactKeyBinding
                                )
                            )
                            ;(0, node_assert_1.default)(
                                compactWithKeyBinding.startsWith(compact)
                            )
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('sd-jwt-vc validation', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'validate that required claim (iss) are included in payload',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const cnf = utils_1.publicHolderKeyJwk
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'vc+sd-jwt'
                                },
                                payload: {
                                    vct: 'IdentityCredential',
                                    iat: 1698056110,
                                    cnf,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withHasher({
                                    hasher: Buffer.from,
                                    algorithm: src_1.HasherAlgorithm.Sha256
                                })
                                .withSaltGenerator(() => 'salt')
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwtVc.toCompact()
                                        }
                                    ),
                                new src_1.SdJwtVcError(
                                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'iss' not found in any level within the payload"
                                )
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'validate that required claim (vct) are included in payload',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const cnf = utils_1.publicHolderKeyJwk
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'vc+sd-jwt'
                                },
                                payload: {
                                    iss: 'https://example.org/issuer',
                                    iat: 1698056110,
                                    cnf,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withHasher({
                                    hasher: Buffer.from,
                                    algorithm: src_1.HasherAlgorithm.Sha256
                                })
                                .withSaltGenerator(() => 'salt')
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwtVc.toCompact()
                                        }
                                    ),
                                new src_1.SdJwtVcError(
                                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'vct' not found in any level within the payload"
                                )
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'validate that required claim (iat) are included in payload',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const cnf = utils_1.publicHolderKeyJwk
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'vc+sd-jwt'
                                },
                                payload: {
                                    vct: 'IdentityCredential',
                                    iss: 'https://example.org/issuer',
                                    cnf,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withHasher({
                                    hasher: Buffer.from,
                                    algorithm: src_1.HasherAlgorithm.Sha256
                                })
                                .withSaltGenerator(() => 'salt')
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwtVc.toCompact()
                                        }
                                    ),
                                new src_1.SdJwtVcError(
                                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'iat' not found in any level within the payload"
                                )
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'validate that required claim (cnf) are included in payload',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'vc+sd-jwt'
                                },
                                payload: {
                                    vct: 'IdentityCredential',
                                    iss: 'https://example.org/issuer',
                                    iat: 1698056110,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withHasher({
                                    hasher: Buffer.from,
                                    algorithm: src_1.HasherAlgorithm.Sha256
                                })
                                .withSaltGenerator(() => 'salt')
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwtVc.toCompact()
                                        }
                                    ),
                                new src_1.SdJwtVcError(
                                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'cnf' not found in any level within the payload"
                                )
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'validate that required claim (typ) are included in header',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA
                                },
                                payload: {
                                    vct: 'IdentityCredential',
                                    iss: 'https://example.org/issuer',
                                    iat: 1698056110,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withHasher({
                                    hasher: Buffer.from,
                                    algorithm: src_1.HasherAlgorithm.Sha256
                                })
                                .withSaltGenerator(() => 'salt')
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwtVc.toCompact()
                                        }
                                    ),
                                new src_1.SdJwtVcError(
                                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'typ' not found in any level within the header"
                                )
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'validate that required claim (alg) are included in header',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    typ: 'vc+sd-jwt'
                                },
                                payload: {
                                    vct: 'IdentityCredential',
                                    iss: 'https://example.org/issuer',
                                    iat: 1698056110,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withHasher({
                                    hasher: Buffer.from,
                                    algorithm: src_1.HasherAlgorithm.Sha256
                                })
                                .withSaltGenerator(() => 'salt')
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwtVc.toCompact()
                                        }
                                    ),
                                new src_1.SdJwtVcError(
                                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'alg' not found in any level within the header"
                                )
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'validate that required claim (alg) are included in header',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'invalid-typ'
                                },
                                payload: {
                                    vct: 'IdentityCredential',
                                    iss: 'https://example.org/issuer',
                                    iat: 1698056110,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(() => new Uint8Array(32).fill(42))
                                .withHasher({
                                    hasher: Buffer.from,
                                    algorithm: src_1.HasherAlgorithm.Sha256
                                })
                                .withSaltGenerator(() => 'salt')
                            yield (0, node_assert_1.rejects)(
                                () =>
                                    __awaiter(
                                        void 0,
                                        void 0,
                                        void 0,
                                        function* () {
                                            return yield sdJwtVc.toCompact()
                                        }
                                    ),
                                new src_1.SdJwtVcError(
                                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'typ' was found, but values did not match within the header"
                                )
                            )
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('verify sd-jwt-vc', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'check whether publicKeyJwk is defined when cnf and keybinding are defined',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const sdJwtVc = src_1.SdJwtVc.fromCompact(
                                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ2Y3QiOiAiSWRlbnRpdHlDcmVkZW50aWFsIiwgImlzcyI6ICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciIsICJpYXQiOiAxNjk4MDU2MTEwLCJjbmYiOiB7Imp3ayI6IHsiY3J2IjogIkVkMjU1MTkiLCAia3R5IjogIk9LUCIsICJ4IjogIkNpclpuLVY5bl9LUmg4YzJJeVdxT3RyVm05d2x6YVZERFM4WTR6R21Rc28ifX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbIlYzbEtlbGxYZURCSmFYZG5TVzFHYTFwSVNteGpNMDFwVEVOQ04wbHVUakJqYlZac1pFWTVhRnBIVW5sYVdFNTZTV3B2WjBscVJYbE5lVUpPV1Zkc2RVbEdUakJKYVhkblNXMTRkbGt5Um5OaFdGSTFTV3B2WjBsclJuVmxXRkoyWkRJMGFVeERRV2xqYlZadVlWYzVkVWxxYjJkSmEwWjFaVmhPTUZsWVVteEphWGRuU1cxT2RtUlhOVEJqYm10cFQybEJhVlpXVFdsbVZqQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxS2NHTnVVbTlhUjBZd1dsTkpjMGxEU1hoUFZGRjNURlJCZUV4VVFYaEpiREEiLCAiVjNsS2VsbFhlREJKYVhkblNXMVdkRmxYYkhOSmFYZG5TVzF3ZG1GSE5XdGlNbFpCV2xob2FHSllRbk5hVXpWcVlqSXdhVmhSIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFhYUdKWGJITmxWamwxV1ZjeGJFbHBkMmRKYTFKMldsTktaQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxa2NHUnRWblZZTWpWb1lsZFZhVXhEUVdsVGJUbHZZbWxLWkEiLCAiVjNsS2VsbFhlREJKYVhkblNXMXNlbGd5T1RKYVdFcG1UVlJuYVV4RFFqQmpibFpzV0ZFIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFzZWxneU9USmFXRXBtVFdwRmFVeERRakJqYmxac1dGRSIsICJWM2xLZWxsWGVEQkphWGRuU1cxc2VsZ3lPVEphV0VwbVRtcFZhVXhEUWpCamJsWnNXRkUiLCAiVjNsS2VsbFhlREJKYVhkblNXNUNiMkl5Tld4WU1qVXhZbGRLYkdOcFNYTkpRMGx5VFZNd2VVMUVTWFJPVkZVeFRGUkJlRTFFUldsWVVRIl19.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~'
                            )
                            // Verify that the `publicKeyJwk` is passed in when the JWT is for keybinding
                            yield sdJwtVc.verify(({ publicKeyJwk, header }) => {
                                if (header.typ === 'kb+jwt')
                                    (0, node_assert_1.default)(publicKeyJwk)
                                return true
                            })
                        })
                )
                ;(0, node_test_1.it)(
                    'Validate the sd-jwt-vc with cnf and keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const cnf = utils_1.publicHolderKeyJwk
                            const keyBinding = yield new src_1.KeyBinding({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'kb+jwt'
                                },
                                payload: {
                                    aud: 'https://example.org/audience',
                                    iat: 1698056120,
                                    nonce: 'some-nonce'
                                }
                            })
                                .withSigner(utils_1.keyBindingSigner)
                                .toCompact()
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'vc+sd-jwt'
                                },
                                payload: {
                                    vct: 'IdentityCredential',
                                    iss: 'https://example.org/issuer',
                                    iat: 1698056110,
                                    cnf,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(utils_1.signer)
                                .withHasher(utils_1.hasherAndAlgorithm)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withKeyBinding(keyBinding)
                            const sdJwtVcWithSignature =
                                yield sdJwtVc.signAndAdd()
                            const result = yield sdJwtVcWithSignature.verify(
                                ({
                                    publicKeyJwk,
                                    header,
                                    message,
                                    signature
                                }) => {
                                    if (
                                        header.alg !==
                                        src_1.SignatureAndEncryptionAlgorithm
                                            .EdDSA
                                    ) {
                                        throw new Error(
                                            `Unsupported algorithm in header: ${header.alg}`
                                        )
                                    }
                                    if (publicKeyJwk) {
                                        const publicKey = (0,
                                        node_crypto_1.createPublicKey)({
                                            key: publicKeyJwk,
                                            format: 'jwk'
                                        })
                                        return (0, node_crypto_1.verify)(
                                            null,
                                            Buffer.from(message),
                                            publicKey,
                                            signature
                                        )
                                    }
                                    return (0, utils_1.verifier)({
                                        signature,
                                        message,
                                        header
                                    })
                                }
                            )
                            ;(0, node_assert_1.deepStrictEqual)(result, {
                                containsRequiredVcProperties: true,
                                isSignatureValid: true,
                                isValid: true,
                                isKeyBindingValid: true
                            })
                        })
                )
                ;(0, node_test_1.it)(
                    'Validate the sd-jwt-vc with cnf and keybinding, where cnf does not match the expected cnf',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const cnf = utils_1.publicHolderKeyJwk
                            const keyBinding = yield new src_1.KeyBinding({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'kb+jwt'
                                },
                                payload: {
                                    aud: 'https://example.org/audience',
                                    iat: 1698056120,
                                    nonce: 'some-nonce'
                                }
                            })
                                .withSigner(utils_1.keyBindingSigner)
                                .toCompact()
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'vc+sd-jwt'
                                },
                                payload: {
                                    vct: 'IdentityCredential',
                                    iss: 'https://example.org/issuer',
                                    iat: 1698056110,
                                    cnf,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(utils_1.signer)
                                .withHasher(utils_1.hasherAndAlgorithm)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withKeyBinding(keyBinding)
                            const sdJwtVcWithSignature =
                                yield sdJwtVc.signAndAdd()
                            const result = yield sdJwtVcWithSignature.verify(
                                ({
                                    publicKeyJwk,
                                    header,
                                    message,
                                    signature
                                }) => {
                                    if (
                                        header.alg !==
                                        src_1.SignatureAndEncryptionAlgorithm
                                            .EdDSA
                                    ) {
                                        throw new Error(
                                            `Unsupported algorithm in header: ${header.alg}`
                                        )
                                    }
                                    if (publicKeyJwk) {
                                        const publicKey = (0,
                                        node_crypto_1.createPublicKey)({
                                            key: publicKeyJwk,
                                            format: 'jwk'
                                        })
                                        return (0, node_crypto_1.verify)(
                                            null,
                                            Buffer.from(message),
                                            publicKey,
                                            signature
                                        )
                                    }
                                    return (0, utils_1.verifier)({
                                        signature,
                                        message,
                                        header
                                    })
                                }
                            )
                            ;(0, node_assert_1.deepStrictEqual)(result, {
                                containsRequiredVcProperties: true,
                                isSignatureValid: true,
                                isValid: true,
                                isKeyBindingValid: true
                            })
                        })
                )
                ;(0, node_test_1.it)(
                    'Validate the sd-jwt-vc with cnf and keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const cnf = utils_1.publicHolderKeyJwk
                            const keyBinding = yield new src_1.KeyBinding({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'kb+jwt'
                                },
                                payload: {
                                    aud: 'https://example.org/audience',
                                    iat: 1698056120,
                                    nonce: 'some-nonce'
                                }
                            })
                                .withSigner(utils_1.keyBindingSigner)
                                .toCompact()
                            const sdJwtVc = new src_1.SdJwtVc({
                                header: {
                                    alg: src_1.SignatureAndEncryptionAlgorithm
                                        .EdDSA,
                                    typ: 'vc+sd-jwt'
                                },
                                payload: {
                                    vct: 'IdentityCredential',
                                    iss: 'https://example.org/issuer',
                                    iat: 1698056110,
                                    cnf,
                                    given_name: 'John',
                                    family_name: 'Doe',
                                    email: 'johndoe@example.com',
                                    phone_number: '+1-202-555-0101',
                                    address: {
                                        street_address: '123 Main St',
                                        locality: 'Anytown',
                                        region: 'Anystate',
                                        country: 'US'
                                    },
                                    birthdate: '1940-01-01',
                                    is_over_18: true,
                                    is_over_21: true,
                                    is_over_65: true
                                }
                            })
                                .withDisclosureFrame({
                                    is_over_65: true,
                                    is_over_21: true,
                                    is_over_18: true,
                                    birthdate: true,
                                    email: true,
                                    address: true,
                                    given_name: true,
                                    family_name: true,
                                    phone_number: true
                                })
                                .withSigner(utils_1.signer)
                                .withHasher(utils_1.hasherAndAlgorithm)
                                .withSaltGenerator(utils_1.saltGenerator)
                                .withKeyBinding(keyBinding)
                            const sdJwtVcWithSignature =
                                yield sdJwtVc.signAndAdd()
                            const result = yield sdJwtVcWithSignature.verify(
                                ({
                                    publicKeyJwk,
                                    header,
                                    message,
                                    signature
                                }) => {
                                    if (
                                        header.alg !==
                                        src_1.SignatureAndEncryptionAlgorithm
                                            .EdDSA
                                    ) {
                                        throw new Error(
                                            `Unsupported algorithm in header: ${header.alg}`
                                        )
                                    }
                                    if (publicKeyJwk) {
                                        const publicKey = (0,
                                        node_crypto_1.createPublicKey)({
                                            key: publicKeyJwk,
                                            format: 'jwk'
                                        })
                                        return (0, node_crypto_1.verify)(
                                            null,
                                            Buffer.from(message),
                                            publicKey,
                                            signature
                                        )
                                    }
                                    return (0, utils_1.verifier)({
                                        signature,
                                        message,
                                        header
                                    })
                                },
                                [],
                                { invalidCnfClaim: { test: 'a' } }
                            )
                            ;(0, node_assert_1.deepStrictEqual)(result, {
                                areRequiredClaimsIncluded: true,
                                containsRequiredVcProperties: true,
                                containsExpectedKeyBinding: false,
                                isSignatureValid: true,
                                isValid: true,
                                isKeyBindingValid: true
                            })
                        })
                )
            })
        )
    })
)
//# sourceMappingURL=sdJwtVc.test.js.map
