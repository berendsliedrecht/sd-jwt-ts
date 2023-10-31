import { before, describe, it } from 'node:test'
import assert, { deepStrictEqual, doesNotThrow, strictEqual } from 'node:assert'

import { prelude, signer, verifier } from './utils'

import { Jwt, SignatureAndEncryptionAlgorithm } from '../src'

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

    describe('jwt verification', async () => {
        it('should verify simple jwt', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: SignatureAndEncryptionAlgorithm.EdDSA })
                .withPayload({ sign: 'me!' })
                .withSigner(signer)

            const compact = await jwt.toCompact()

            strictEqual(typeof compact, 'string')

            const fromCompact = Jwt.fromCompact(compact)

            const { isSignatureValid, isValid } =
                await fromCompact.verify(verifier)

            assert(isSignatureValid)
            assert(isValid)
        })

        it('should verify simple jwt with exp', async () => {
            const nextMonth = new Date()
            nextMonth.setMonth(new Date().getMonth() + 1)

            const jwt = new Jwt()
                .withHeader({ alg: SignatureAndEncryptionAlgorithm.EdDSA })
                .withPayload({
                    sign: 'me!',
                    exp: nextMonth.getTime() / 1000
                })
                .withSigner(signer)

            const compact = await jwt.toCompact()

            strictEqual(typeof compact, 'string')

            const fromCompact = Jwt.fromCompact(compact)

            const { isSignatureValid, isValid, isExpiryTimeValid } =
                await fromCompact.verify(verifier)

            assert(isSignatureValid)
            assert(isExpiryTimeValid)
            assert(isValid)
        })

        it('should verify simple jwt with nbf', async () => {
            const lastMonth = new Date()
            lastMonth.setMonth(new Date().getMonth() - 1)

            const jwt = new Jwt()
                .withHeader({ alg: SignatureAndEncryptionAlgorithm.EdDSA })
                .withPayload({
                    sign: 'me!',
                    nbf: lastMonth.getTime() / 1000
                })
                .withSigner(signer)

            const compact = await jwt.toCompact()

            strictEqual(typeof compact, 'string')

            const fromCompact = Jwt.fromCompact(compact)

            const { isSignatureValid, isValid, isNotBeforeValid } =
                await fromCompact.verify(verifier)

            assert(isSignatureValid)
            assert(isNotBeforeValid)
            assert(isValid)
        })

        it('should verify simple jwt with required claims', async () => {
            const lastMonth = new Date()
            lastMonth.setMonth(new Date().getMonth() - 1)

            const jwt = new Jwt()
                .withHeader({ alg: SignatureAndEncryptionAlgorithm.EdDSA })
                .withPayload({
                    sign: 'me!',
                    nbf: lastMonth.getTime() / 1000
                })
                .withSigner(signer)

            const compact = await jwt.toCompact()

            strictEqual(typeof compact, 'string')

            const fromCompact = Jwt.fromCompact<{}, { sign: string }>(compact)

            const { isSignatureValid, isValid, areRequiredClaimsIncluded } =
                await fromCompact.verify(verifier, ['sign'])

            assert(isSignatureValid)
            assert(areRequiredClaimsIncluded)
            assert(isValid)
        })

        it('should verify simple jwt with all fields', async () => {
            const lastMonth = new Date()
            lastMonth.setMonth(new Date().getMonth() - 1)

            const nextMonth = new Date()
            nextMonth.setMonth(new Date().getMonth() + 1)

            const jwt = new Jwt()
                .withHeader({ alg: SignatureAndEncryptionAlgorithm.EdDSA })
                .withPayload({
                    sign: 'me!',
                    nbf: lastMonth.getTime() / 1000,
                    exp: nextMonth.getTime() / 1000
                })
                .withSigner(signer)

            const compact = await jwt.toCompact()

            strictEqual(typeof compact, 'string')

            const fromCompact = Jwt.fromCompact<{}, { sign: string }>(compact)

            const {
                isSignatureValid,
                isValid,
                areRequiredClaimsIncluded,
                isNotBeforeValid,
                isExpiryTimeValid
            } = await fromCompact.verify(verifier, ['sign'])

            assert(isSignatureValid)
            assert(isExpiryTimeValid)
            assert(isNotBeforeValid)
            assert(areRequiredClaimsIncluded)
            assert(isValid)
        })

        it('should not verify simple jwt with invalid signature', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: SignatureAndEncryptionAlgorithm.EdDSA })
                .withPayload({
                    sign: 'me!'
                })
                .withSignature(new Uint8Array(32).fill(42))

            const compact = await jwt.toCompact()

            strictEqual(typeof compact, 'string')

            const fromCompact = Jwt.fromCompact<{}, { sign: string }>(compact)

            const { isSignatureValid, isValid } =
                await fromCompact.verify(verifier)

            assert(!isSignatureValid)
            assert(!isValid)
        })

        it('should not verify simple jwt with invalid exp', async () => {
            const lastMonth = new Date()
            lastMonth.setMonth(new Date().getMonth() - 1)

            const jwt = new Jwt()
                .withHeader({ alg: SignatureAndEncryptionAlgorithm.EdDSA })
                .withPayload({
                    sign: 'me!',
                    exp: lastMonth.getTime() / 1000
                })
                .withSigner(signer)

            const compact = await jwt.toCompact()

            strictEqual(typeof compact, 'string')

            const fromCompact = Jwt.fromCompact<{}, { sign: string }>(compact)

            const { isSignatureValid, isValid, isExpiryTimeValid } =
                await fromCompact.verify(verifier)

            assert(isSignatureValid)
            assert(!isExpiryTimeValid)
            assert(!isValid)
        })

        it('should not verify simple jwt with invalid nbf', async () => {
            const nextMonth = new Date()
            nextMonth.setMonth(new Date().getMonth() + 1)

            const jwt = new Jwt()
                .withHeader({ alg: SignatureAndEncryptionAlgorithm.EdDSA })
                .withPayload({
                    sign: 'me!',
                    nbf: nextMonth.getTime() / 1000
                })
                .withSigner(signer)

            const compact = await jwt.toCompact()

            strictEqual(typeof compact, 'string')

            const fromCompact = Jwt.fromCompact<{}, { sign: string }>(compact)

            const { isSignatureValid, isValid, isNotBeforeValid } =
                await fromCompact.verify(verifier)

            assert(isSignatureValid)
            assert(!isNotBeforeValid)
            assert(!isValid)
        })

        it('should not verify simple jwt with invalid required claims', async () => {
            const jwt = new Jwt()
                .withHeader({ alg: SignatureAndEncryptionAlgorithm.EdDSA })
                .withPayload({
                    sign: 'me!'
                })
                .withSigner(signer)

            const compact = await jwt.toCompact()

            strictEqual(typeof compact, 'string')

            const fromCompact = Jwt.fromCompact<{}, { sign: string }>(compact)

            const { isSignatureValid, isValid, areRequiredClaimsIncluded } =
                await fromCompact.verify(verifier, [
                    'claim_a',
                    'claim_b',
                    'nbf',
                    'iss'
                ])

            assert(isSignatureValid)
            assert(!isValid)
            assert(!areRequiredClaimsIncluded)
        })
    })

    describe('assert claims', () => {
        it('assert top-level claims in payload and header', () => {
            const jwt = new Jwt({
                header: { alg: 'ES256' },
                payload: { iss: 'https://example.org' },
                signature: new Uint8Array(32).fill(42)
            })

            doesNotThrow(() =>
                jwt.assertClaimInPayload('iss', 'https://example.org')
            )

            doesNotThrow(() => jwt.assertClaimInHeader('alg', 'ES256'))
        })

        it('assert nested-level claims in payload and header', () => {
            const jwt = new Jwt({
                header: { alg: 'ES256', nested: { nestedHeaderClaim: 'foo' } },
                payload: {
                    iss: 'https://example.org',
                    nested: { nestedPayloadClaim: [1, 2, 3] }
                },
                signature: new Uint8Array(32).fill(42)
            })

            doesNotThrow(() =>
                jwt.assertClaimInPayload('nestedPayloadClaim', [1, 2, 3])
            )

            doesNotThrow(() =>
                jwt.assertClaimInHeader('nestedHeaderClaim', 'foo')
            )
        })
    })

    describe('get claims', () => {
        it('get assert top-level claims in payload and header', () => {
            const jwt = new Jwt({
                header: { alg: 'ES256' },
                payload: { iss: 'https://example.org' },
                signature: new Uint8Array(32).fill(42)
            })

            deepStrictEqual(jwt.getClaimInHeader('alg'), 'ES256')
            deepStrictEqual(jwt.getClaimInPayload('iss'), 'https://example.org')
        })

        it('assert nested-level claims in payload and header', () => {
            const jwt = new Jwt({
                header: { alg: 'ES256', nested: { nestedHeaderClaim: 'foo' } },
                payload: {
                    iss: 'https://example.org',
                    nested: { nestedPayloadClaim: [1, 2, 3] }
                },
                signature: new Uint8Array(32).fill(42)
            })

            deepStrictEqual(
                jwt.getClaimInPayload('nestedPayloadClaim'),
                [1, 2, 3]
            )

            deepStrictEqual(jwt.getClaimInHeader('nestedHeaderClaim'), 'foo')
        })
    })
})
