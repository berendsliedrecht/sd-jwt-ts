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
const node_test_1 = require('node:test')
const node_assert_1 = require('node:assert')
const src_1 = require('../src')
const swapClaim_1 = require('../src/sdJwt/swapClaim')
const utils_1 = require('./utils')
;(0, node_test_1.describe)('swap claims', () =>
    __awaiter(void 0, void 0, void 0, function* () {
        ;(0, node_test_1.describe)('swap single claim', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('swap object single claim', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const payload = {
                            _sd: ['JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E']
                        }
                        const disclosure = new src_1.Disclosure(
                            'salt',
                            'value',
                            'key'
                        )
                        const prettyClaims = yield (0, swapClaim_1.swapClaims)(
                            utils_1.hasherAndAlgorithm.hasher,
                            payload,
                            [disclosure]
                        )
                        ;(0, node_assert_1.deepStrictEqual)(prettyClaims, {
                            key: 'value'
                        })
                    })
                )
                ;(0, node_test_1.it)('swap array claim', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const payload = {
                            someArray: [
                                {
                                    '...': '8szvPmTqpPa0pf0YcnIJ19jGuKuFNtKYFpQatP7dXNI'
                                }
                            ]
                        }
                        const disclosure = new src_1.Disclosure('salt', 'value')
                        const prettyClaims = yield (0, swapClaim_1.swapClaims)(
                            utils_1.hasherAndAlgorithm.hasher,
                            payload,
                            [disclosure]
                        )
                        ;(0, node_assert_1.deepStrictEqual)(prettyClaims, {
                            someArray: ['value']
                        })
                    })
                )
                ;(0, node_test_1.it)(
                    'should not swap claim that is not in the object',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const payload = {
                                _sd: ['abba']
                            }
                            const disclosure = new src_1.Disclosure(
                                'salt',
                                'value',
                                'key'
                            )
                            const prettyClaims = yield (0,
                            swapClaim_1.swapClaims)(
                                utils_1.hasherAndAlgorithm.hasher,
                                payload,
                                [disclosure]
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                prettyClaims,
                                {}
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'should not swap claim that is not in the object, but only ones that work',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const payload = {
                                _sd: [
                                    'abba',
                                    'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E'
                                ]
                            }
                            const disclosure = new src_1.Disclosure(
                                'salt',
                                'value',
                                'key'
                            )
                            const prettyClaims = yield (0,
                            swapClaim_1.swapClaims)(
                                utils_1.hasherAndAlgorithm.hasher,
                                payload,
                                [disclosure]
                            )
                            ;(0, node_assert_1.deepStrictEqual)(prettyClaims, {
                                key: 'value'
                            })
                        })
                )
            })
        )
        ;(0, node_test_1.describe)('swap multiple claims', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('swap object multiple claim', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const payload = {
                            _sd: [
                                'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E',
                                'svTQmxMQAojzr63PVqHXnIUxqxyo-sHDzAMnLcKjKRs'
                            ]
                        }
                        const disclosureOne = new src_1.Disclosure(
                            'salt',
                            'value',
                            'key'
                        )
                        const disclosureTwo = new src_1.Disclosure(
                            'salt',
                            { hello: 'world' },
                            'keyTwo'
                        )
                        const prettyClaims = yield (0, swapClaim_1.swapClaims)(
                            utils_1.hasherAndAlgorithm.hasher,
                            payload,
                            [disclosureOne, disclosureTwo]
                        )
                        ;(0, node_assert_1.deepStrictEqual)(prettyClaims, {
                            key: 'value',
                            keyTwo: { hello: 'world' }
                        })
                    })
                )
                ;(0, node_test_1.it)('swap multiple array claims', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const payload = {
                            someArray: [
                                {
                                    '...': '8szvPmTqpPa0pf0YcnIJ19jGuKuFNtKYFpQatP7dXNI'
                                },
                                {
                                    '...': 'w9JvA2goSCRDWdWqyRHB9WfmK23_txf2qq6P_Vv77Xk'
                                }
                            ]
                        }
                        const disclosureOne = new src_1.Disclosure(
                            'salt',
                            'value'
                        )
                        const disclosureTwo = new src_1.Disclosure('salt', {
                            hello: 'world'
                        })
                        const prettyClaims = yield (0, swapClaim_1.swapClaims)(
                            utils_1.hasherAndAlgorithm.hasher,
                            payload,
                            [disclosureOne, disclosureTwo]
                        )
                        ;(0, node_assert_1.deepStrictEqual)(prettyClaims, {
                            someArray: ['value', { hello: 'world' }]
                        })
                    })
                )
                ;(0, node_test_1.it)('swap complex nested disclosures', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        const payload = {
                            cleartextclaim: true,
                            _sd: [
                                'g8mHOW_TLNiLKUpGdKmc7Lsh6CYaU2mtgk1-5eSjglg'
                            ],
                            nested: {
                                nestedcleartextclaim: ['hello', 'world'],
                                _sd: [
                                    '9mR4VRAMdShEDAt_dN1XWXQuccfoByCFiVCxcJBDQz8'
                                ],
                                moreNested: [
                                    'a',
                                    {
                                        '...': 'jCSRikjCOQNQreSSGj-fpjPJ4ENtBVhriC5i8CuyjNo'
                                    }
                                ]
                            },
                            _sd_alg: 'sha-256'
                        }
                        const disclosureOne = new src_1.Disclosure(
                            'salt',
                            'toplevel',
                            'toplevelkey'
                        )
                        const disclosureTwo = new src_1.Disclosure(
                            'salt',
                            'nested',
                            'nestedkey'
                        )
                        const disclosureThree = new src_1.Disclosure(
                            'salt',
                            'arrayitem'
                        )
                        const prettyClaims = yield (0, swapClaim_1.swapClaims)(
                            utils_1.hasherAndAlgorithm.hasher,
                            payload,
                            [disclosureOne, disclosureTwo, disclosureThree]
                        )
                        ;(0, node_assert_1.deepStrictEqual)(prettyClaims, {
                            cleartextclaim: true,
                            toplevelkey: 'toplevel',
                            nested: {
                                nestedkey: 'nested',
                                nestedcleartextclaim: ['hello', 'world'],
                                moreNested: ['a', 'arrayitem']
                            }
                        })
                    })
                )
            })
        )
        ;(0, node_test_1.describe)('Roundtrip', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'should roundtrip from and to pretty claims',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            var _a, _b
                            const prettyClaims = {
                                cleartext: 123,
                                hello: 'world',
                                nested: {
                                    nestedField: true,
                                    nestedArray: ['1', '2', '3']
                                }
                            }
                            const sdJwt = new src_1.SdJwt(
                                {
                                    header: { alg: 'EdDSA' },
                                    payload: prettyClaims
                                },
                                {
                                    disclosureFrame: {
                                        hello: true,
                                        __decoyCount: 3,
                                        nested: {
                                            nestedArray: [true, false, true],
                                            nestedField: true
                                        }
                                    },
                                    signer: utils_1.signer,
                                    saltGenerator: utils_1.saltGenerator,
                                    hasherAndAlgorithm:
                                        utils_1.hasherAndAlgorithm
                                }
                            )
                            yield sdJwt.applyDisclosureFrame()
                            const disclosures =
                                (_a = sdJwt.disclosures) !== null &&
                                _a !== void 0
                                    ? _a
                                    : []
                            const sdPayload =
                                (_b = sdJwt.payload) !== null && _b !== void 0
                                    ? _b
                                    : {}
                            const receivedPrettyClaims = yield (0,
                            swapClaim_1.swapClaims)(
                                utils_1.hasherAndAlgorithm.hasher,
                                sdPayload,
                                disclosures
                            )
                            ;(0, node_assert_1.deepStrictEqual)(
                                receivedPrettyClaims,
                                {
                                    cleartext: 123,
                                    hello: 'world',
                                    nested: {
                                        nestedField: true,
                                        nestedArray: ['1', '2', '3']
                                    }
                                }
                            )
                        })
                )
            })
        )
    })
)
//# sourceMappingURL=swapClaim.test.js.map
