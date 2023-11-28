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
const node_assert_1 = __importStar(require('node:assert'))
const node_test_1 = require('node:test')
const utils_1 = require('./utils')
const presentationFrame_1 = require('../src/sdJwt/presentationFrame')
const src_1 = require('../src')
;(0, node_test_1.describe)('presentationFrame', () =>
    __awaiter(void 0, void 0, void 0, function* () {
        ;(0, node_test_1.before)(utils_1.prelude)
        ;(0, node_test_1.it)('disclosure', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const sdJwt = new src_1.SdJwt(
                    {
                        header: { alg: 'EdDSA' },
                        payload: {
                            iss: 'https://example.org/issuer',
                            nested_field: {
                                more_nested_field: { a: [1, 2, 3, 4] }
                            },
                            credential: {
                                firstName: 'John',
                                lastName: 'Doe',
                                ageOver18: true,
                                ageOver21: true,
                                ageOver65: false
                            },
                            mustDiscloseWholeObject: {
                                ifYouWantToDisclose: 'thisKey'
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
                                more_nested_field: {
                                    a: [true, true, false, true]
                                },
                                __decoyCount: 5
                            },
                            credential: {
                                ageOver18: true,
                                ageOver21: true,
                                ageOver65: true,
                                firstName: true,
                                lastName: true
                            },
                            mustDiscloseWholeObject: true
                        },
                        hasherAndAlgorithm: {
                            hasher: (data) => Buffer.from(data),
                            algorithm: src_1.HasherAlgorithm.Sha256
                        }
                    }
                )
                // NOTE: we need to apply the disclosure frame, otherwise payload is the input payload
                yield sdJwt.applyDisclosureFrame()
                const disclosures = sdJwt.disclosures
                const requiredDisclosures = yield (0,
                presentationFrame_1.getDisclosuresForPresentationFrame)(
                    sdJwt.payload,
                    {
                        nested_field: {
                            more_nested_field: { a: [true, false, false, true] }
                        },
                        credential: {
                            ageOver21: true,
                            firstName: true,
                            lastName: true
                        },
                        mustDiscloseWholeObject: true
                    },
                    yield sdJwt.getPrettyClaims(),
                    (data) => Buffer.from(data),
                    disclosures
                )
                ;(0, node_assert_1.deepStrictEqual)(requiredDisclosures, [
                    disclosures[1],
                    disclosures[3],
                    disclosures[5],
                    disclosures[7],
                    disclosures[8],
                    disclosures[9]
                ])
            })
        )
        ;(0, node_test_1.it)('arrays and nested arrays', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const disclosures = [
                    src_1.Disclosure.fromArray([
                        'salt',
                        'array',
                        [
                            {
                                '...': 'V3lKellXeDBJaXdnVzNzaUxpNHVJam9nSWxZemJFdGxiR3hZWlVSQ1NtRllaRzVUVnpGSFpWZE9kRkpxVmxsbGEwcHRXa2N4UjJNeVVsaFdiVnBPVW1wcmVWZFdaRFJOVm5CVVUyMVJJbjFkWFE'
                            },
                            'array_1_value'
                        ]
                    ]),
                    src_1.Disclosure.fromArray([
                        'salt',
                        [
                            {
                                '...': 'V3lKellXeDBJaXdnSW1GeWNtRjVYekJmZG1Gc2RXVmZNRjkyWVd4MVpTSmQ'
                            }
                        ]
                    ]),
                    src_1.Disclosure.fromArray([
                        'salt',
                        'array_0_value_0_value'
                    ])
                ]
                const requiredDisclosures = yield (0,
                presentationFrame_1.getDisclosuresForPresentationFrame)(
                    {
                        _sd: [
                            'V3lKellXeDBJaXdnSW1GeWNtRjVJaXdnVzNzaUxpNHVJam9nSWxZemJFdGxiR3hZWlVSQ1NtRllaRzVXZWs1NllWVjRjRTVJVmtwaGJUbHVVMWQ0V21WdFNrWmtSM2hwVWpOb1dsZHNWbE5STVU1MFVteHNZVko2VmxWV2JuQkhVMFp3VjFwRk9XdFNhM0I0Vm0xNGMySkhSWGRqU0ZKWVlUSk9ORlZxU2s1bFZsWnpZVVprYVZadVFsQldWekYzWTIxV1YxcEdaR0ZTUmtwUFZtMDFRMVpXVlhsTlZrcEtZbXBHYTFkR1JTSjlMQ0poY25KaGVWOHhYM1poYkhWbElsMWQ'
                        ]
                    },
                    {
                        array: [true]
                    },
                    {
                        array: [['array_0_value_0_value'], 'array_1_value']
                    },
                    (data) => Buffer.from(data),
                    disclosures
                )
                ;(0, node_assert_1.deepStrictEqual)(
                    [...requiredDisclosures].sort(),
                    [...disclosures].sort()
                )
            })
        )
        ;(0, node_test_1.it)(
            'error when presentation frame does not match payload structure',
            () =>
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
                                    more_nested_field: {
                                        a: [true, true, false, true]
                                    },
                                    __decoyCount: 5
                                }
                            },
                            hasherAndAlgorithm: {
                                hasher: (data) => Buffer.from(data),
                                algorithm: src_1.HasherAlgorithm.Sha256
                            }
                        }
                    )
                    // NOTE: we need to apply the disclosure frame, otherwise payload is the input payload
                    yield sdJwt.applyDisclosureFrame()
                    const disclosures = sdJwt.disclosures
                    yield node_assert_1.default.rejects(
                        (0,
                        presentationFrame_1.getDisclosuresForPresentationFrame)(
                            sdJwt.payload,
                            {
                                // @ts-ignore
                                nested_field: [true]
                            },
                            yield sdJwt.getPrettyClaims(),
                            (data) => Buffer.from(data),
                            disclosures
                        ),
                        'Path nested_field.0 from presentation frame is not present in pretty SD-JWT payload.'
                    )
                })
        )
    })
)
//# sourceMappingURL=presentationFrame.test.js.map
