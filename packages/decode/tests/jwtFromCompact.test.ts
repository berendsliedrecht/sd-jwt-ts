import { describe, it } from 'node:test'
import { deepStrictEqual, throws } from 'node:assert'

import { jwtFromCompact } from '../src/jwt'

describe('jwt from compact', () => {
    describe('successful decoding of compact jwt', () => {
        it('simple jwt 01', () => {
            const compact =
                'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUub3JnIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'

            const decoded = jwtFromCompact(compact)

            deepStrictEqual(decoded, {
                header: { alg: 'ES256' },
                payload: { iss: 'https://example.org' },
                signature: new Uint8Array(32).fill(42)
            })
        })

        it('simple jwt 02', () => {
            const compact =
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'

            const decoded = jwtFromCompact(compact)

            deepStrictEqual(decoded, {
                header: { kid: 'a' },
                payload: { exp: 123 },
                signature: new Uint8Array(32).fill(42)
            })
        })
    })
    describe('failed decoding of compact jwt', () => {
        it('do not allow sd-jwt', () => {
            const compact =
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~'

            throws(() => jwtFromCompact(compact), Error)
        })

        it('do not allow more than 2 periods (.)', () => {
            const compact = 'e.e.e.e.e.e.e'

            throws(() => jwtFromCompact(compact), Error)
        })

        it('do not allow less than 2 periods (.)', () => {
            const compact = 'e.e'

            throws(() => jwtFromCompact(compact), Error)
        })
    })
})
