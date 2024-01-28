import { before, describe, it } from 'node:test'
import { doesNotReject, rejects, strictEqual } from 'node:assert'

import { hasherAndAlgorithm, prelude } from './utils'

import { KeyBinding, SdJwt } from '../src'

describe('key binding', async () => {
    before(prelude)

    describe('using a jwt as keybinding material', async () => {
        it('correctly validate jwt for key binding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000,
                    _sd_hash: 'something'
                },
                signature: new Uint8Array(32).fill(42)
            }).withExpectedSdHash('something')

            await doesNotReject(
                async () => await jwt.assertValidForKeyBinding()
            )
        })

        it('error when jwt does not have a header for keybinding', async () => {
            const jwt = new KeyBinding({
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt does not have a payload for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt does not have a signature for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000
                }
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt does not have a alg in the header for keybinding', async () => {
            const jwt = new KeyBinding({
                // @ts-ignore
                header: { typ: 'kb+jwt' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt does not have a typ in the header for keybinding', async () => {
            const jwt = new KeyBinding({
                // @ts-ignore
                header: { alg: 'ES256' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt has a typ in the header for keybinding, but of invalid value', async () => {
            const jwt = new KeyBinding({
                // @ts-ignore
                header: { alg: 'ES256', typ: 'not+for+kb+jwt' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt the "aud" is missing in the payload for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                // @ts-ignore
                payload: {
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt the "iat" is missing in the payload for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                // @ts-ignore
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd'
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt the "nonce" is missing in the payload for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                // @ts-ignore
                payload: {
                    aud: 'https://example.org/aud',
                    iat: new Date().getTime() / 1000
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt the "iat" is not missing, but invalid type in the payload for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                payload: {
                    aud: 'https://example.org/aud',
                    // @ts-ignore
                    iat: 'an-invalid-timestamp'
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt the "sd_hash" is missing in the payload for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                // @ts-ignore
                payload: {
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000,
                    aud: 'aud'
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(jwt.assertValidForKeyBinding)
        })

        it('error when jwt the "sd_hash" does not match the provided expectedSdHash', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                // @ts-ignore
                payload: {
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000,
                    aud: 'aud',
                    _sd_hash: 'something'
                },
                signature: new Uint8Array(32).fill(42)
            })

            await rejects(() => jwt.assertValidForKeyBinding('something-else'))
        })

        it('error when jwt the "sd_hash" does not match the expectedSdHash on the class', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                // @ts-ignore
                payload: {
                    nonce: 'abcd',
                    iat: new Date().getTime() / 1000,
                    aud: 'aud',
                    _sd_hash: 'something'
                },
                signature: new Uint8Array(32).fill(42)
            }).withExpectedSdHash('something-else-2')

            await rejects(jwt.assertValidForKeyBinding)
        })
    })

    describe('Integrity Protection', async () => {
        it('create key binding with integrity protection', async () => {
            const keyBinding = new KeyBinding(
                {
                    header: { alg: 'ES256', typ: 'kb+jwt' },
                    payload: {
                        aud: 'https://example.org/aud',
                        nonce: 'abcd',
                        iat: 1200
                    }
                },
                {
                    signer: () => new Uint8Array(32).fill(32)
                }
            )

            const sdJwt = new SdJwt(
                {
                    header: { val: 'one', val2: 'three' },
                    payload: { iss: 'me', secret: 'not-really' },
                    keyBinding
                },
                {
                    disclosureFrame: { secret: true },
                    saltGenerator: () => 'salt',
                    hasherAndAlgorithm,
                    signer: () => new Uint8Array(32).fill(42)
                }
            )

            const presentation = await sdJwt.present({ secret: true })
            strictEqual(
                presentation,
                'eyJ2YWwiOiAib25lIiwgInZhbDIiOiAidGhyZWUifQ.eyJpc3MiOiAibWUiLCAiX3NkX2FsZyI6ICJzaGEtMjU2IiwgIl9zZCI6IFsiNWptNW40cl9iRl9IMFB5M2xFRGYwbXBlbXkyRzdLZW5rR05nUmw1UF9LdyJdfQ.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgInNlY3JldCIsICJub3QtcmVhbGx5Il0~eyJhbGciOiAiRVMyNTYiLCAidHlwIjogImtiK2p3dCJ9.eyJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWQiLCAibm9uY2UiOiAiYWJjZCIsICJpYXQiOiAxMjAwLCJfc2RfaGFzaCI6ICJTVWhFYWVSbmt1NTFCY3UzMk93eWlqUWJFcVgtSzNpLU90ME81VUlFMDdvIn0.ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA'
            )

            const verificationResult = await SdJwt.fromCompact(presentation)
                .withHasher(hasherAndAlgorithm)
                .verify(() => true)

            strictEqual(verificationResult.isValid, true)
        })

        it('throws when _sd_hash does not match calculated sd hash from compact sd-jwt', async () => {
            const sdJwt = SdJwt.fromCompact(
                'eyJ2YWwiOiAib25lIiwgInZhbDIiOiAidGhyZWUifQ.eyJpc3MiOiAibWUiLCAiX3NkX2FsZyI6ICJzaGEtMjU2IiwgIl9zZCI6IFsiNWptNW40cl9iRl9IMFB5M2xFRGYwbXBlbXkyRzdLZW5rR05nUmw1UF9LdyJdfQ.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgInNlY3JldCIsICJub3QtcmVhbGx5Il0~eyJhbGciOiAiRVMyNTYiLCAidHlwIjogImtiK2p3dCJ9.eyJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWQiLCAibm9uY2UiOiAiYWJjZCIsICJpYXQiOiAxMjAwLCJfc2RfaGFzaCI6ICJpbmNvcnJlY3Qtc2QtaGFzaCJ9.ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA'
            ).withHasher(hasherAndAlgorithm)

            await rejects(
                sdJwt.verify(() => true),
                {
                    message:
                        "jwt is not valid for usage with key binding. Error: Claim key '_sd_hash' was found, but values did not match within the payload"
                }
            )
        })
    })
})
