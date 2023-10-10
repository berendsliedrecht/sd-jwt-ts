import { before, describe, it } from 'node:test'
import { deepStrictEqual, strictEqual } from 'node:assert'

import { prelude } from './utils'

import { Jwt } from '../src'

describe('JWT', async () => {
    before(prelude)

    describe('Creation', async () => {
        it('create basic JWT', async () => {
            const jwt = new Jwt({
                header: { alg: 'ES256' },
                payload: { iss: 'https://example.org' },
                signature: new Uint8Array(32).fill(42)
            })

            const compactJwt = await jwt.toCompact()

            strictEqual(
                compactJwt,
                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create basic JWT with "add" builder', async () => {
            const jwt = new Jwt()
                .addHeaderClaim('alg', 'ES256')
                .addPayloadClaim('iss', 'https://example.org')
                .withSignature(new Uint8Array(32).fill(42))

            const compactJwt = await jwt.toCompact()

            strictEqual(
                compactJwt,
                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create basic JWT with "with" builder', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: 'ES256' })
                .withPayload({ iss: 'https://example.org' })
                .withSignature(new Uint8Array(32).fill(42))

            const compactJwt = await jwt.toCompact()

            strictEqual(
                compactJwt,
                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create basic JWT and override property', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: 'EdDSA' })
                .withPayload({ iss: 'https://example.org' })
                .withSignature(new Uint8Array(32).fill(42))

            const jwtWithNewAlg = jwt.addHeaderClaim('alg', 'ES256')

            const compactJwt = await jwtWithNewAlg.toCompact()

            strictEqual(
                compactJwt,
                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create basic JWT with fake signer', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: 'ES256' })
                .withPayload({ iss: 'https://example.org' })
                .withSigner(() => new Uint8Array(32).fill(42))

            const compactJwt = await jwt.toCompact()

            strictEqual(
                compactJwt,
                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
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

            strictEqual(
                compactJwt,
                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.NjU3OTRhNjg2MjQ3NjM2OTRmNjk0MTY5NTI1NjRkNzk0ZTU0NTk2OTY2NTEyZTY1Nzk0YTcwNjMzMzRkNjk0ZjY5NDE2OTYxNDg1MjMwNjM0ODRkMzY0Yzc5Mzk2YzY1NDc0Njc0NjM0Nzc4NmM0YzZkMzk3OTVhNzk0YTM5'
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

            strictEqual(
                compactJwt,
                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZyJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )

            const fromCompactJwt = Jwt.fromCompact<
                typeof header,
                typeof payload
            >(compactJwt)

            deepStrictEqual(fromCompactJwt.header, header)
            deepStrictEqual(fromCompactJwt.payload, payload)
            deepStrictEqual(fromCompactJwt.signature, signature)
        })
    })
})
