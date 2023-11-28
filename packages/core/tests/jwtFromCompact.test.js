'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const node_test_1 = require('node:test')
const node_assert_1 = require('node:assert')
const utils_1 = require('./utils')
const src_1 = require('../src')
const jwt_1 = require('../src/jwt')
;(0, node_test_1.describe)('jwt from compact', () => {
    ;(0, node_test_1.before)(utils_1.prelude)
    ;(0, node_test_1.describe)('succesful decoding of compact jwt', () => {
        ;(0, node_test_1.it)('simple jwt 01', () => {
            const compact =
                'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUub3JnIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            const decoded = (0, jwt_1.jwtFromCompact)(compact)
            ;(0, node_assert_1.deepStrictEqual)(decoded, {
                header: { alg: 'ES256' },
                payload: { iss: 'https://example.org' },
                signature: new Uint8Array(32).fill(42)
            })
        })
        ;(0, node_test_1.it)('simple jwt 02', () => {
            const compact =
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            const decoded = (0, jwt_1.jwtFromCompact)(compact)
            ;(0, node_assert_1.deepStrictEqual)(decoded, {
                header: { kid: 'a' },
                payload: { exp: 123 },
                signature: new Uint8Array(32).fill(42)
            })
        })
    })
    ;(0, node_test_1.describe)('failed decoding of compact jwt', () => {
        ;(0, node_test_1.it)('do not allow sd-jwt', () => {
            const compact =
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~'
            ;(0, node_assert_1.throws)(
                () => (0, jwt_1.jwtFromCompact)(compact),
                src_1.JwtError
            )
        })
        ;(0, node_test_1.it)('do not allow more than 2 periods (.)', () => {
            const compact = 'e.e.e.e.e.e.e'
            ;(0, node_assert_1.throws)(
                () => (0, jwt_1.jwtFromCompact)(compact),
                src_1.JwtError
            )
        })
        ;(0, node_test_1.it)('do not allow less than 2 periods (.)', () => {
            const compact = 'e.e'
            ;(0, node_assert_1.throws)(
                () => (0, jwt_1.jwtFromCompact)(compact),
                src_1.JwtError
            )
        })
    })
})
//# sourceMappingURL=jwtFromCompact.test.js.map
