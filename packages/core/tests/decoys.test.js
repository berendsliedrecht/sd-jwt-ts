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
const node_crypto_1 = require('node:crypto')
const node_assert_1 = require('node:assert')
const node_test_1 = require('node:test')
const utils_1 = require('./utils')
const sdJwt_1 = require('../src/sdJwt')
;(0, node_test_1.describe)('decoys', () =>
    __awaiter(void 0, void 0, void 0, function* () {
        ;(0, node_test_1.before)(utils_1.prelude)
        ;(0, node_test_1.it)('Create correct amount of decoys', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const decoys = yield (0, sdJwt_1.createDecoys)(
                    10,
                    () => 'salt',
                    (input) => Uint8Array.from(Buffer.from(input))
                )
                ;(0, node_assert_1.deepStrictEqual)(
                    decoys,
                    new Array(10).fill(
                        Buffer.from('salt').toString('base64url')
                    )
                )
            })
        )
        ;(0, node_test_1.it)('Sha256 decoys have the correct length', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const decoys = yield (0, sdJwt_1.createDecoys)(
                    10,
                    () =>
                        (0, node_crypto_1.getRandomValues)(
                            Buffer.alloc(128 / 8)
                        ).toString('base64url'),
                    (input) =>
                        (0, node_crypto_1.createHash)('sha256')
                            .update(input)
                            .digest()
                )
                decoys.forEach((d) =>
                    (0, node_assert_1.strictEqual)(d.length, 43)
                )
            })
        )
    })
)
//# sourceMappingURL=decoys.test.js.map
