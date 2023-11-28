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
const utils_1 = require('./utils')
const src_1 = require('../src')
;(0, node_test_1.describe)('key binding', () =>
    __awaiter(void 0, void 0, void 0, function* () {
        ;(0, node_test_1.before)(utils_1.prelude)
        ;(0, node_test_1.describe)('using a jwt as keybinding material', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)(
                    'correctly validate jwt for key binding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                header: { alg: 'ES256', typ: 'kb+jwt' },
                                payload: {
                                    aud: 'https://example.org/aud',
                                    nonce: 'abcd',
                                    iat: new Date().getTime() / 1000
                                },
                                signature: new Uint8Array(32).fill(42)
                            })
                            ;(0, node_assert_1.doesNotReject)(() =>
                                __awaiter(void 0, void 0, void 0, function* () {
                                    return yield jwt.assertValidForKeyBinding()
                                })
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt does not have a header for keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                payload: {
                                    aud: 'https://example.org/aud',
                                    nonce: 'abcd',
                                    iat: new Date().getTime() / 1000
                                },
                                signature: new Uint8Array(32).fill(42)
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt does not have a payload for keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                header: { alg: 'ES256', typ: 'kb+jwt' },
                                signature: new Uint8Array(32).fill(42)
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt does not have a signature for keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                header: { alg: 'ES256', typ: 'kb+jwt' },
                                payload: {
                                    aud: 'https://example.org/aud',
                                    nonce: 'abcd',
                                    iat: new Date().getTime() / 1000
                                }
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt does not have a alg in the header for keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                // @ts-ignore
                                header: { typ: 'kb+jwt' },
                                payload: {
                                    aud: 'https://example.org/aud',
                                    nonce: 'abcd',
                                    iat: new Date().getTime() / 1000
                                },
                                signature: new Uint8Array(32).fill(42)
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt does not have a typ in the header for keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                // @ts-ignore
                                header: { alg: 'ES256' },
                                payload: {
                                    aud: 'https://example.org/aud',
                                    nonce: 'abcd',
                                    iat: new Date().getTime() / 1000
                                },
                                signature: new Uint8Array(32).fill(42)
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt has a typ in the header for keybinding, but of invalid value',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                // @ts-ignore
                                header: { alg: 'ES256', typ: 'not+for+kb+jwt' },
                                payload: {
                                    aud: 'https://example.org/aud',
                                    nonce: 'abcd',
                                    iat: new Date().getTime() / 1000
                                },
                                signature: new Uint8Array(32).fill(42)
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt the "aud" is missing in the payload for keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                header: { alg: 'ES256', typ: 'kb+jwt' },
                                // @ts-ignore
                                payload: {
                                    nonce: 'abcd',
                                    iat: new Date().getTime() / 1000
                                },
                                signature: new Uint8Array(32).fill(42)
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt the "iat" is missing in the payload for keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                header: { alg: 'ES256', typ: 'kb+jwt' },
                                // @ts-ignore
                                payload: {
                                    aud: 'https://example.org/aud',
                                    nonce: 'abcd'
                                },
                                signature: new Uint8Array(32).fill(42)
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt the "nonce" is missing in the payload for keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                header: { alg: 'ES256', typ: 'kb+jwt' },
                                // @ts-ignore
                                payload: {
                                    aud: 'https://example.org/aud',
                                    iat: new Date().getTime() / 1000
                                },
                                signature: new Uint8Array(32).fill(42)
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
                ;(0, node_test_1.it)(
                    'error when jwt the "iat" is not missing, but invalid type in the payload for keybinding',
                    () =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const jwt = new src_1.KeyBinding({
                                header: { alg: 'ES256', typ: 'kb+jwt' },
                                payload: {
                                    aud: 'https://example.org/aud',
                                    // @ts-ignore
                                    iat: 'an-invalid-timestamp'
                                },
                                signature: new Uint8Array(32).fill(42)
                            })
                            yield (0, node_assert_1.rejects)(
                                jwt.assertValidForKeyBinding
                            )
                        })
                )
            })
        )
    })
)
//# sourceMappingURL=keyBinding.test.js.map
