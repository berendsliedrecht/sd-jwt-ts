import { describe, it } from 'node:test'
import { deepStrictEqual, throws } from 'node:assert'

import { sdJwtFromCompact } from '../src/sdJwt'

describe('sd-jwt from compact', () => {
    describe('successful decoding of compact jwt', () => {
        it('simple sd-jwt without disclosures or kb-jwt', () => {
            const compact =
                'eyJhbGciOiAiRWREU0EifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9pc3N1ZXIifQ.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~'

            const decoded = sdJwtFromCompact(compact)

            deepStrictEqual(decoded, {
                header: { alg: 'EdDSA' },
                payload: { iss: 'https://example.org/issuer' },
                signature: new Uint8Array(32).fill(41)
            })
        })

        it('simple sd-jwt without disclosures with kb-jwt', () => {
            const compact =
                'eyJhbGciOiAiRWREU0EifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9pc3N1ZXIifQ.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~eyJ0eXAiOiAia2Irand0IiwgImFsZyI6ICJFUzI1NiJ9.eyJpYXQiOiAxMjMsIm5vbmNlIjogInNlY3VyZS1ub25jZSIsICJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'

            const decoded = sdJwtFromCompact(compact)

            deepStrictEqual(decoded, {
                header: { alg: 'EdDSA' },
                payload: { iss: 'https://example.org/issuer' },
                signature: new Uint8Array(32).fill(41),
                keyBinding: {
                    header: {
                        typ: 'kb+jwt',
                        alg: 'ES256'
                    },
                    payload: {
                        iat: 123,
                        nonce: 'secure-nonce',
                        aud: 'https://example.org/audience'
                    },
                    signature: new Uint8Array(32).fill(42)
                },
                disclosures: []
            })
        })

        it('simple sd-jwt with disclosures without kb-jwt', () => {
            const compact =
                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJhR0Z6YUEiLCAiYUdGemFBIl19.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~'

            const decoded = sdJwtFromCompact(compact)

            deepStrictEqual(decoded, {
                header: { alg: 'EdDSA' },
                payload: { _sd_alg: 'sha-256', _sd: ['aGFzaA', 'aGFzaA'] },
                signature: new Uint8Array(32).fill(41),
                keyBinding: undefined,
                disclosures: [
                    {
                        key: 'iss',
                        salt: 'salt',
                        value: 'https://example.org/issuer',
                        encoded:
                            'WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd'
                    }
                ]
            })
        })

        it('simple sd-jwt with disclosures with kb-jwt', () => {
            const compact =
                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJhR0Z6YUEiLCAiYUdGemFBIl19.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~eyJ0eXAiOiAia2Irand0IiwgImFsZyI6ICJFUzI1NiJ9.eyJpYXQiOiAxMjMsIm5vbmNlIjogInNlY3VyZS1ub25jZSIsICJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'

            const decoded = sdJwtFromCompact(compact)

            deepStrictEqual(decoded, {
                header: { alg: 'EdDSA' },
                payload: { _sd_alg: 'sha-256', _sd: ['aGFzaA', 'aGFzaA'] },
                signature: new Uint8Array(32).fill(41),
                keyBinding: {
                    header: {
                        typ: 'kb+jwt',
                        alg: 'ES256'
                    },
                    payload: {
                        iat: 123,
                        nonce: 'secure-nonce',
                        aud: 'https://example.org/audience'
                    },
                    signature: new Uint8Array(32).fill(42)
                },
                disclosures: [
                    {
                        key: 'iss',
                        salt: 'salt',
                        value: 'https://example.org/issuer',
                        encoded:
                            'WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd'
                    }
                ]
            })
        })
    })

    describe('failed decoding of compact sd-jwt', () => {
        it('do not allow jwt', () => {
            const compact =
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'

            throws(() => sdJwtFromCompact(compact), Error)
        })
    })
})
