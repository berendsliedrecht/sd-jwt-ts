import { describe, it } from 'node:test'
import assert from 'node:assert'

import { KeyBinding } from '../src'

describe('key binding', async () => {
    describe('using a jwt as keybinding material', async () => {
        it('correctly validate jwt for key binding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime()
                },
                signature: new Uint8Array(32).fill(42)
            })

            assert.doesNotThrow(() => jwt.assertValidForKeyBinding())
        })

        it('error when jwt does not have a header for keybinding', async () => {
            const jwt = new KeyBinding({
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime()
                },
                signature: new Uint8Array(32).fill(42)
            })

            assert.throws(jwt.assertValidForKeyBinding)
        })

        it('error when jwt does not have a payload for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                signature: new Uint8Array(32).fill(42)
            })

            assert.throws(jwt.assertValidForKeyBinding)
        })

        it('error when jwt does not have a signature for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime()
                }
            })

            assert.throws(jwt.assertValidForKeyBinding)
        })

        it('error when jwt does not have a alg in the header for keybinding', async () => {
            const jwt = new KeyBinding({
                // @ts-ignore
                header: { typ: 'kb+jwt' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime()
                },
                signature: new Uint8Array(32).fill(42)
            })

            assert.throws(jwt.assertValidForKeyBinding)
        })

        it('error when jwt does not have a typ in the header for keybinding', async () => {
            const jwt = new KeyBinding({
                // @ts-ignore
                header: { alg: 'ES256' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime()
                },
                signature: new Uint8Array(32).fill(42)
            })

            assert.throws(jwt.assertValidForKeyBinding)
        })

        it('error when jwt has a typ in the header for keybinding, but of invalid value', async () => {
            const jwt = new KeyBinding({
                // @ts-ignore
                header: { alg: 'ES256', typ: 'not+for+kb+jwt' },
                payload: {
                    aud: 'https://example.org/aud',
                    nonce: 'abcd',
                    iat: new Date().getTime()
                },
                signature: new Uint8Array(32).fill(42)
            })

            assert.throws(jwt.assertValidForKeyBinding)
        })

        it('error when jwt the "aud" is missing in the payload for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                // @ts-ignore
                payload: {
                    nonce: 'abcd',
                    iat: new Date().getTime()
                },
                signature: new Uint8Array(32).fill(42)
            })

            assert.throws(jwt.assertValidForKeyBinding)
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

            assert.throws(jwt.assertValidForKeyBinding)
        })

        it('error when jwt the "nonce" is missing in the payload for keybinding', async () => {
            const jwt = new KeyBinding({
                header: { alg: 'ES256', typ: 'kb+jwt' },
                // @ts-ignore
                payload: {
                    aud: 'https://example.org/aud',
                    iat: new Date().getTime()
                },
                signature: new Uint8Array(32).fill(42)
            })

            assert.throws(jwt.assertValidForKeyBinding)
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

            assert.throws(jwt.assertValidForKeyBinding)
        })
    })
})
