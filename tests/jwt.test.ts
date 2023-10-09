import { describe, it } from 'node:test'
import assert from 'node:assert'

import { Jwt } from '../src'

describe('JWT', async () => {
    describe('Creation', async () => {
        it('create basic JWT', async () => {
            const jwt = new Jwt({
                header: { alg: 'ES256' },
                payload: { iss: 'https://example.org' },
                signature: new Uint8Array(32).fill(42)
            })

            const compactJwt = await jwt.toCompact()

            assert.strictEqual(
                compactJwt,
                'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUub3JnIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create basic JWT with "add" builder', async () => {
            const jwt = new Jwt()
                .addHeaderClaim('alg', 'ES256')
                .addPayloadClaim('iss', 'https://example.org')
                .withSignature(new Uint8Array(32).fill(42))

            const compactJwt = await jwt.toCompact()

            assert.strictEqual(
                compactJwt,
                'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUub3JnIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create basic JWT with "with" builder', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: 'ES256' })
                .withPayload({ iss: 'https://example.org' })
                .withSignature(new Uint8Array(32).fill(42))

            const compactJwt = await jwt.toCompact()

            assert.strictEqual(
                compactJwt,
                'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUub3JnIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create basic JWT and override property', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: 'EdDSA' })
                .withPayload({ iss: 'https://example.org' })
                .withSignature(new Uint8Array(32).fill(42))

            const jwtWithNewAlg = jwt.addHeaderClaim('alg', 'ES256')

            const compactJwt = await jwtWithNewAlg.toCompact()

            assert.strictEqual(
                compactJwt,
                'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUub3JnIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create basic JWT with fake signer', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: 'ES256' })
                .withPayload({ iss: 'https://example.org' })
                .withSigner(() => new Uint8Array(32).fill(42))

            const compactJwt = await jwt.toCompact()

            assert.strictEqual(
                compactJwt,
                'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUub3JnIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create basic JWT with signer', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: 'ES256' })
                .withPayload({ iss: 'https://example.org' })
                // mock signing function that uses the input to create a signature-like array
                .withSigner((input) =>
                    Uint8Array.from(
                        Buffer.from(Buffer.from(input).toString('hex'))
                    )
                )

            const compactJwt = await jwt.toCompact()

            assert.strictEqual(
                compactJwt,
                'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUub3JnIn0.NjU3OTRhNjg2MjQ3NjM2OTRmNjk0YTQ2NTU3YTQ5MzE0ZTY5NGEzOTJlNjU3OTRhNzA2MzMzNGQ2OTRmNjk0YTZmNjQ0ODUyNzc2MzdhNmY3NjRjMzI1NjM0NTk1NzMxNzc2MjQ3NTU3NTYyMzM0YTZlNDk2ZTMw'
            )
        })

        it('create basic JWT from compact', async () => {
            const header = {
                alg: 'ES256'
            }

            const payload = {
                iss: 'https://example.org'
            }

            const signature = new Uint8Array(32).fill(42)

            const jwt = new Jwt<typeof header, typeof payload>({
                header,
                payload,
                signature
            })

            const compactJwt = await jwt.toCompact()

            assert.strictEqual(
                compactJwt,
                'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUub3JnIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )

            const fromCompactJwt = Jwt.fromCompact<
                typeof header,
                typeof payload
            >(compactJwt)

            assert.deepStrictEqual(fromCompactJwt.header, header)
            assert.deepStrictEqual(fromCompactJwt.payload, payload)
            assert.deepStrictEqual(fromCompactJwt.signature, signature)
        })
    })
})
