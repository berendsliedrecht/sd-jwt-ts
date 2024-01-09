import { before, describe, it, skip } from 'node:test'
import { doesNotReject, rejects } from 'node:assert'

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
                    iat: new Date().getTime() / 1000
                },
                signature: new Uint8Array(32).fill(42)
            })

            doesNotReject(async () => await jwt.assertValidForKeyBinding())
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
    })

    describe('Integrity Protection', async () => {
        skip('create key binding with integrity protection', async () => {
            const keyBinding = new KeyBinding(
                {
                    header: { alg: 'ES256', typ: 'kb+jwt' },
                    payload: {
                        aud: 'https://example.org/aud',
                        nonce: 'abcd',
                        iat: 1200
                    },
                    signature: new Uint8Array(32).fill(42)
                }
                // { hasher: hasherAndAlgorithm }
            )

            const sdjwt = new SdJwt(
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

            const presentation = await sdjwt.present({ secret: true })

            // const kbWithIntegrityProtection =
            //     await keyBinding.withIntegrityProtection(presentation)

            // console.log(await kbWithIntegrityProtection.toCompact())

            // const compact = await kbWithIntegrityProtection.toCompact()

            // strictEqual(
            //     compact,
            //     'eyJhbGciOiAiRVMyNTYiLCAidHlwIjogImtiK2p3dCJ9.eyJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWQiLCAibm9uY2UiOiAiYWJjZCIsICJpYXQiOiAxMjAwLCJfc2RfaGFzaCI6ICJER2FtSmJOS3oweFg5X3F4ejFTUm0ybkQxVm9qem9iN3NFZndMS2dZOXdZIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            // )
        })
    })
})
