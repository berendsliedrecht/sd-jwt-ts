import { before, describe, it } from 'node:test'
import assert from 'node:assert'
import {
    SignatureAndEncryptionAlgorithm,
    HasherAlgorithm,
    KeyBinding,
    SdJwt,
    SdJwtError
} from '../src'
import { prelude } from './utils'

describe('sd-jwt', async () => {
    before(prelude)

    describe('JWT without selective disclosure', async () => {
        it('should create a simple jwt', async () => {
            const sdJwt = await new SdJwt({
                header: { kid: 'a' },
                payload: { exp: 123 },
                signature: Uint8Array.from([1, 2, 3])
            }).toCompact()

            assert.deepStrictEqual(
                sdJwt,
                'eyJraWQiOiAiYSJ9.eyJleHAiOiAxMjN9.AQID'
            )
        })

        it('should create a simple jwt with builder', async () => {
            const sdJwt = await new SdJwt()
                .withHeader({ kid: 'a' })
                .withPayload({ exp: 123 })
                .withSignature(Uint8Array.from([1, 2, 3]))
                .toCompact()

            assert.deepStrictEqual(
                sdJwt,
                'eyJraWQiOiAiYSJ9.eyJleHAiOiAxMjN9.AQID'
            )
        })

        it('should create a simple jwt with builder', async () => {
            const sdJwt = await new SdJwt()
                .withHeader({ kid: 'a' })
                .withPayload({ exp: 123 })
                .withSignature(Uint8Array.from([1, 2, 3]))
                .toCompact()

            assert.deepStrictEqual(
                sdJwt,
                'eyJraWQiOiAiYSJ9.eyJleHAiOiAxMjN9.AQID'
            )
        })

        it('should create a simple jwt with add builder', async () => {
            const sdJwt = await new SdJwt()
                .addHeaderClaim('kid', 'a')
                .addPayloadClaim('exp', 123)
                .withSignature(Uint8Array.from([1, 2, 3]))
                .toCompact()

            assert.deepStrictEqual(
                sdJwt,
                'eyJraWQiOiAiYSJ9.eyJleHAiOiAxMjN9.AQID'
            )
        })

        it('should create an instance of sdJwt from a compact sdJwt', async () => {
            const sdJwt = SdJwt.fromCompact<{ kid: string }, { exp: number }>(
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID'
            )

            assert.deepStrictEqual(sdJwt.header.kid, 'a')
            assert.deepStrictEqual(sdJwt.payload.exp, 123)
            assert.deepStrictEqual(sdJwt.signature, Uint8Array.from([1, 2, 3]))
        })

        it('should create an instance of sdJwt from a compact sdJwt with disclosable', async () => {
            const sdJwt = SdJwt.fromCompactSdJwt<
                { kid: string },
                { exp: number }
            >(
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID~WyJDa0J1NE1NNklkX3RSUmRYMVptOC13IiwiZmlyc3RfbmFtZSIsIkJlcmVuZCBTbGllZHJlY2h0Il0~'
            )

            assert.deepStrictEqual(sdJwt.header.kid, 'a')
            assert.deepStrictEqual(sdJwt.payload.exp, 123)
            assert.deepStrictEqual(sdJwt.signature, Uint8Array.from([1, 2, 3]))
            assert.deepStrictEqual(
                sdJwt.disclosures?.map((d) => d.toString()),
                [
                    'WyJDa0J1NE1NNklkX3RSUmRYMVptOC13IiwgImZpcnN0X25hbWUiLCAiQmVyZW5kIFNsaWVkcmVjaHQiXQ'
                ]
            )
        })
    })

    describe('JWT assert correct methods', async () => {
        it('should error when creating compact format without header', async () => {
            const sdJwt = new SdJwt()
                .addPayloadClaim('exp', 123)
                .withSignature(Uint8Array.from([1, 2, 3]))

            assert.rejects(
                async () => await sdJwt.toCompact(),
                new SdJwtError('Header must be defined')
            )
        })

        it('should error when creating compact format without payload', async () => {
            const sdJwt = new SdJwt()
                .addHeaderClaim('kid', 'a')
                .withSignature(Uint8Array.from([1, 2, 3]))

            assert.rejects(
                async () => await sdJwt.toCompact(),
                new SdJwtError('Payload must be defined')
            )
        })

        it('should error when verifying the signature without a signature', async () => {
            const sdJwt = new SdJwt()
                .addHeaderClaim('kid', 'a')
                .addPayloadClaim('some', 'claim')

            assert.rejects(
                async () => await sdJwt.verifySignature(() => true),
                new SdJwtError('Signature must be defined')
            )
        })

        it('should error when no salt method is provided', async () => {
            assert.rejects(
                () =>
                    new SdJwt(
                        {
                            header: { kid: 'a' },
                            payload: { exp: 123, sub: 'a' },
                            signature: Uint8Array.from([1, 2, 3])
                        },
                        {
                            disclosureFrame: { sub: true },
                            hasherAndAlgorithm: {
                                hasher: () => 'hash',
                                algorithm: HasherAlgorithm.Sha256
                            }
                        }
                    ).toCompact(),
                new SdJwtError(
                    'Cannot create a disclosure without a salt generator. You can set it with this.withSaltGenerator()'
                )
            )
        })

        it('should error when no hash method is provided', async () => {
            assert.rejects(
                () =>
                    new SdJwt(
                        {
                            header: { kid: 'a' },

                            payload: { exp: 123, sub: 'a' },
                            signature: Uint8Array.from([1, 2, 3])
                        },
                        { disclosureFrame: { sub: true } }
                    )
                        .withSaltGenerator(() => 'salt')
                        .toCompact(),
                new SdJwtError(
                    'A hasher and algorithm must be set in order to create a digest of a disclosure. You can set it with this.withHasherAndAlgorithm()'
                )
            )
        })

        it('should error when no signer method is provided', async () => {
            assert.rejects(
                () =>
                    new SdJwt(
                        {
                            header: { kid: 'a' },
                            payload: { exp: 123, sub: 'a' },
                            signature: Uint8Array.from([1, 2, 3])
                        },
                        { disclosureFrame: { sub: true } }
                    ).signAndAdd(),
                new SdJwtError(
                    'A signer must be provided to create a signature. You can set it with this.withSigner()'
                )
            )
        })
    })

    describe('SD-JWT with key binding', async () => {
        it('should create an sd-jwt with key binding', async () => {
            const keyBinding = new KeyBinding(
                {
                    header: {
                        typ: 'kb+jwt',
                        alg: SignatureAndEncryptionAlgorithm.ES256
                    },
                    payload: {
                        iat: 123,
                        nonce: 'secure-nonce',
                        aud: 'https://example.org/audience'
                    }
                },
                { signer: () => new Uint8Array(32).fill(42) }
            )

            const sdJwt = new SdJwt<
                { alg: 'EdDSA' },
                { iss: 'https://example.org/issuer' }
            >(
                {
                    header: { alg: 'EdDSA' },
                    payload: { iss: 'https://example.org/issuer' },
                    keyBinding
                },
                {
                    signer: () => new Uint8Array(32).fill(41),
                    saltGenerator: () => 'salt',
                    disclosureFrame: { iss: true, __decoyCount: 1 },
                    hasherAndAlgorithm: {
                        hasher: () => 'hash',
                        algorithm: HasherAlgorithm.Sha256
                    }
                }
            )

            const compactSdJwt = await sdJwt.toCompact()

            assert(!compactSdJwt.endsWith('~'))

            assert.strictEqual(
                compactSdJwt,
                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJoYXNoIiwgImhhc2giXX0.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~eyJ0eXAiOiAia2Irand0IiwgImFsZyI6ICJFUzI1NiJ9.eyJpYXQiOiAxMjMsIm5vbmNlIjogInNlY3VyZS1ub25jZSIsICJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('should create an sd-jwt with key binding, without disclosures', async () => {
            const keyBinding = new KeyBinding(
                {
                    header: {
                        typ: 'kb+jwt',
                        alg: SignatureAndEncryptionAlgorithm.ES256
                    },
                    payload: {
                        iat: 123,
                        nonce: 'secure-nonce',
                        aud: 'https://example.org/audience'
                    }
                },
                { signer: () => new Uint8Array(32).fill(42) }
            )

            const sdJwt = new SdJwt<
                { alg: 'EdDSA' },
                { iss: 'https://example.org/issuer' }
            >(
                {
                    header: { alg: 'EdDSA' },
                    payload: { iss: 'https://example.org/issuer' },
                    keyBinding
                },
                {
                    signer: () => new Uint8Array(32).fill(41),
                    saltGenerator: () => 'salt',
                    hasherAndAlgorithm: {
                        hasher: () => 'hash',
                        algorithm: HasherAlgorithm.Sha256
                    }
                }
            )

            const compactSdJwt = await sdJwt.toCompact()

            assert(!compactSdJwt.endsWith('~'))

            assert.strictEqual(
                compactSdJwt,
                'eyJhbGciOiAiRWREU0EifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9pc3N1ZXIiLCAiX3NkX2FsZyI6ICJzaGEtMjU2In0.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~eyJ0eXAiOiAia2Irand0IiwgImFsZyI6ICJFUzI1NiJ9.eyJpYXQiOiAxMjMsIm5vbmNlIjogInNlY3VyZS1ub25jZSIsICJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )
        })

        it('create sd-jwt with key binding and compare', async () => {
            const keyBinding = new KeyBinding(
                {
                    header: {
                        typ: 'kb+jwt',
                        alg: SignatureAndEncryptionAlgorithm.ES256
                    },
                    payload: {
                        iat: 123,
                        nonce: 'secure-nonce',
                        aud: 'https://example.org/audience'
                    }
                },
                { signer: () => new Uint8Array(32).fill(42) }
            )

            const sdJwt = new SdJwt<
                { alg: 'EdDSA' },
                { iss: 'https://example.org/issuer' }
            >(
                {
                    header: { alg: 'EdDSA' },
                    payload: { iss: 'https://example.org/issuer' },
                    keyBinding
                },
                {
                    signer: () => new Uint8Array(32).fill(41),
                    saltGenerator: () => 'salt',
                    disclosureFrame: { iss: true, __decoyCount: 1 },
                    hasherAndAlgorithm: {
                        hasher: () => 'hash',
                        algorithm: HasherAlgorithm.Sha256
                    }
                }
            )

            assert.deepStrictEqual(sdJwt.keyBinding, keyBinding)
        })

        it('create sd-jwt with key binding from compact round trip', async () => {
            const keyBinding = new KeyBinding(
                {
                    header: {
                        typ: 'kb+jwt',
                        alg: SignatureAndEncryptionAlgorithm.ES256
                    },
                    payload: {
                        iat: 123,
                        nonce: 'secure-nonce',
                        aud: 'https://example.org/audience'
                    }
                },
                { signer: () => new Uint8Array(32).fill(42) }
            )

            const sdJwt = new SdJwt<
                { alg: 'EdDSA' },
                { iss: 'https://example.org/issuer' }
            >(
                {
                    header: { alg: 'EdDSA' },
                    payload: { iss: 'https://example.org/issuer' },
                    keyBinding
                },
                {
                    signer: () => new Uint8Array(32).fill(41),
                    saltGenerator: () => 'salt',
                    disclosureFrame: { iss: true, __decoyCount: 1 },
                    hasherAndAlgorithm: {
                        hasher: () => 'hash',
                        algorithm: HasherAlgorithm.Sha256
                    }
                }
            )

            const compactSdJwt = await sdJwt.toCompact()

            assert(!compactSdJwt.endsWith('~'))

            assert.strictEqual(
                compactSdJwt,
                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJoYXNoIiwgImhhc2giXX0.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~eyJ0eXAiOiAia2Irand0IiwgImFsZyI6ICJFUzI1NiJ9.eyJpYXQiOiAxMjMsIm5vbmNlIjogInNlY3VyZS1ub25jZSIsICJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSJ9.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )

            const fromCompactSdJwt = SdJwt.fromCompactSdJwt(
                compactSdJwt
            ).withSigner(() => new Uint8Array(32).fill(42))

            const roundTrippedSdJwt = await fromCompactSdJwt.toCompact()

            assert.deepStrictEqual(compactSdJwt, roundTrippedSdJwt)
        })
    })

    describe('from and to compact form', async () => {
        it('create a simple compact sd-jwt', async () => {
            const sdJwt = new SdJwt<
                { alg: 'EdDSA' },
                { iss: 'https://example.org/issuer' }
            >(
                {
                    header: { alg: 'EdDSA' },
                    payload: { iss: 'https://example.org/issuer' }
                },
                {
                    signer: () => new Uint8Array(32).fill(41),
                    saltGenerator: () => 'salt',
                    disclosureFrame: { iss: true, __decoyCount: 1 },
                    hasherAndAlgorithm: {
                        hasher: () => 'hash',
                        algorithm: HasherAlgorithm.Sha256
                    }
                }
            )

            assert.strictEqual(
                await sdJwt.toCompact(),
                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJoYXNoIiwgImhhc2giXX0.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~'
            )
        })

        it('create a complex compact sd-jwt', async () => {
            const sdJwt = new SdJwt(
                {
                    header: { alg: 'EdDSA' },
                    payload: {
                        iss: 'https://example.org/issuer',
                        nested_field: {
                            more_nested_field: { a: [1, 2, 3, 4] }
                        }
                    }
                },
                {
                    signer: () => new Uint8Array(32).fill(41),
                    saltGenerator: () => 'salt',
                    disclosureFrame: {
                        iss: true,
                        __decoyCount: 1,
                        nested_field: {
                            more_nested_field: true,
                            __decoyCount: 5
                        }
                    },
                    hasherAndAlgorithm: {
                        hasher: () => 'hash',
                        algorithm: HasherAlgorithm.Sha256
                    }
                }
            )

            assert.strictEqual(
                await sdJwt.toCompact(),
                'eyJhbGciOiAiRWREU0EifQ.eyJuZXN0ZWRfZmllbGQiOiB7Il9zZCI6IFsiaGFzaCIsICJoYXNoIiwgImhhc2giLCAiaGFzaCIsICJoYXNoIiwgImhhc2giXX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbImhhc2giLCAiaGFzaCJdfQ.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~WyJzYWx0IiwgIm1vcmVfbmVzdGVkX2ZpZWxkIiwgeyJhIjogWzEsMiwzLDRdfV0~'
            )
        })

        it('Roundtrip compact format sd-jwt', async () => {
            const compact =
                'eyJhbGciOiAiRWREU0EifQ.eyJfc2RfYWxnIjogInNoYS0yNTYiLCAibmVzdGVkX2ZpZWxkIjogeyJtb3JlX25lc3RlZF9maWVsZCI6IHsiYSI6IFsiMSIsIDIsMyw0XX19LCJfc2QiOiBbImhhc2giLCAiaGFzaCJdfQ.KSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSk~WyJzYWx0IiwgImlzcyIsICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciJd~WyJzYWx0IiwgIm1vcmVfbmVzdGVkX2ZpZWxkIiwgeyJhIjogWyIxIiwgMiwzLDRdfV0~'

            const sdJwt = SdJwt.fromCompactSdJwt(compact)
                .withHasher({
                    hasher: () => 'hash',
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSigner(() => new Uint8Array(32).fill(41))
                .withSaltGenerator(() => 'salt')

            assert.strictEqual(await sdJwt.toCompact(), compact)
        })

        it('Specification: A.4.  Example 4b - W3C Verifiable Credentials Data Model v2.0 - 01', async () => {
            const compact =
                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLmNvbS9pc3N1ZXIiLCAiaWF0IjogMTY4MzAwMDAwMCwgImV4cCI6IDE4ODMwMDAwMDAsICJAY29udGV4dCI6IFsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCAiaHR0cHM6Ly93M2lkLm9yZy92YWNjaW5hdGlvbi92MSJdLCAidHlwZSI6IFsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCAiVmFjY2luYXRpb25DZXJ0aWZpY2F0ZSJdLCAiaXNzdWVyIjogImh0dHBzOi8vZXhhbXBsZS5jb20vaXNzdWVyIiwgImlzc3VhbmNlRGF0ZSI6ICIyMDIzLTAyLTA5VDExOjAxOjU5WiIsICJleHBpcmF0aW9uRGF0ZSI6ICIyMDI4LTAyLTA4VDExOjAxOjU5WiIsICJuYW1lIjogIkNPVklELTE5IFZhY2NpbmF0aW9uIENlcnRpZmljYXRlIiwgImRlc2NyaXB0aW9uIjogIkNPVklELTE5IFZhY2NpbmF0aW9uIENlcnRpZmljYXRlIiwgImNyZWRlbnRpYWxTdWJqZWN0IjogeyJfc2QiOiBbIjFWX0stOGxEUThpRlhCRlhiWlk5ZWhxUjRIYWJXQ2k1VDB5Ykl6WlBld3ciLCAiSnpqTGd0UDI5ZFAtQjN0ZDEyUDY3NGdGbUsyenk4MUhNdEJnZjZDSk5XZyIsICJSMmZHYmZBMDdaX1lsa3FtTlp5bWExeHl5eDFYc3RJaVM2QjFZYmwySlo0IiwgIlRDbXpybDdLMmdldl9kdTdwY01JeXpSTEhwLVllZy1GbF9jeHRyVXZQeGciLCAiVjdrSkJMSzc4VG1WRE9tcmZKN1p1VVBIdUtfMmNjN3laUmE0cVYxdHh3TSIsICJiMGVVc3ZHUC1PRERkRm9ZNE5semxYYzN0RHNsV0p0Q0pGNzVOdzhPal9nIiwgInpKS19lU01YandNOGRYbU1aTG5JOEZHTTA4ekozX3ViR2VFTUotNVRCeTAiXSwgInZhY2NpbmUiOiB7Il9zZCI6IFsiMWNGNWhMd2toTU5JYXFmV0pyWEk3Tk1XZWRMLTlmNlkyUEE1MnlQalNaSSIsICJIaXk2V1d1ZUxENWJuMTYyOTh0UHY3R1hobWxkTURPVG5CaS1DWmJwaE5vIiwgIkxiMDI3cTY5MWpYWGwtakM3M3ZpOGViT2o5c214M0MtX29nN2dBNFRCUUUiXSwgInR5cGUiOiAiVmFjY2luZSJ9LCAicmVjaXBpZW50IjogeyJfc2QiOiBbIjFsU1FCTlkyNHEwVGg2T0d6dGhxLTctNGw2Y0FheHJZWE9HWnBlV19sbkEiLCAiM256THE4MU0yb04wNndkdjFzaEh2T0VKVnhaNUtMbWREa0hFREpBQldFSSIsICJQbjFzV2kwNkc0TEpybm4tX1JUMFJiTV9IVGR4blBKUXVYMmZ6V3ZfSk9VIiwgImxGOXV6ZHN3N0hwbEdMYzcxNFRyNFdPN01HSnphN3R0N1FGbGVDWDRJdHciXSwgInR5cGUiOiAiVmFjY2luZVJlY2lwaWVudCJ9LCAidHlwZSI6ICJWYWNjaW5hdGlvbkV2ZW50In0sICJfc2RfYWxnIjogInNoYS0yNTYifQ.5jJEqiRViN_DJ4VMxHQIN4KK-Cdfn30nY3nRe5jGxS5Pths5G7mF1GWy9TawYuyFwCze7qiCIx_MhJ68Uu5zeQ~WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImF0Y0NvZGUiLCAiSjA3QlgwMyJd~WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgIm1lZGljaW5hbFByb2R1Y3ROYW1lIiwgIkNPVklELTE5IFZhY2NpbmUgTW9kZXJuYSJd~WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgIm1hcmtldGluZ0F1dGhvcml6YXRpb25Ib2xkZXIiLCAiTW9kZXJuYSBCaW90ZWNoIl0~WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgIm5leHRWYWNjaW5hdGlvbkRhdGUiLCAiMjAyMS0wOC0xNlQxMzo0MDoxMloiXQ~WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgImNvdW50cnlPZlZhY2NpbmF0aW9uIiwgIkdFIl0~WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRhdGVPZlZhY2NpbmF0aW9uIiwgIjIwMjEtMDYtMjNUMTM6NDA6MTJaIl0~WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgIm9yZGVyIiwgIjMvMyJd~WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgImdlbmRlciIsICJGZW1hbGUiXQ~WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgImJpcnRoRGF0ZSIsICIxOTYxLTA4LTE3Il0~WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgImdpdmVuTmFtZSIsICJNYXJpb24iXQ~WyI1YlBzMUlxdVpOYTBoa2FGenp6Wk53IiwgImZhbWlseU5hbWUiLCAiTXVzdGVybWFubiJd~WyI1YTJXMF9OcmxFWnpmcW1rXzdQcS13IiwgImFkbWluaXN0ZXJpbmdDZW50cmUiLCAiUHJheGlzIFNvbW1lcmdhcnRlbiJd~WyJ5MXNWVTV3ZGZKYWhWZGd3UGdTN1JRIiwgImJhdGNoTnVtYmVyIiwgIjE2MjYzODI3MzYiXQ~WyJIYlE0WDhzclZXM1FEeG5JSmRxeU9BIiwgImhlYWx0aFByb2Zlc3Npb25hbCIsICI4ODMxMTAwMDAwMTUzNzYiXQ~'

            const sdJwt = SdJwt.fromCompactSdJwt(compact)

            assert.deepStrictEqual(sdJwt.header, { alg: 'ES256' })
            assert.deepStrictEqual(sdJwt.payload, {
                iss: 'https://example.com/issuer',
                iat: 1683000000,
                exp: 1883000000,
                '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    'https://w3id.org/vaccination/v1'
                ],
                type: ['VerifiableCredential', 'VaccinationCertificate'],
                issuer: 'https://example.com/issuer',
                issuanceDate: '2023-02-09T11:01:59Z',
                expirationDate: '2028-02-08T11:01:59Z',
                name: 'COVID-19 Vaccination Certificate',
                description: 'COVID-19 Vaccination Certificate',
                _sd_alg: 'sha-256',
                credentialSubject: {
                    _sd: [
                        '1V_K-8lDQ8iFXBFXbZY9ehqR4HabWCi5T0ybIzZPeww',
                        'JzjLgtP29dP-B3td12P674gFmK2zy81HMtBgf6CJNWg',
                        'R2fGbfA07Z_YlkqmNZyma1xyyx1XstIiS6B1Ybl2JZ4',
                        'TCmzrl7K2gev_du7pcMIyzRLHp-Yeg-Fl_cxtrUvPxg',
                        'V7kJBLK78TmVDOmrfJ7ZuUPHuK_2cc7yZRa4qV1txwM',
                        'b0eUsvGP-ODDdFoY4NlzlXc3tDslWJtCJF75Nw8Oj_g',
                        'zJK_eSMXjwM8dXmMZLnI8FGM08zJ3_ubGeEMJ-5TBy0'
                    ],
                    recipient: {
                        _sd: [
                            '1lSQBNY24q0Th6OGzthq-7-4l6cAaxrYXOGZpeW_lnA',
                            '3nzLq81M2oN06wdv1shHvOEJVxZ5KLmdDkHEDJABWEI',
                            'Pn1sWi06G4LJrnn-_RT0RbM_HTdxnPJQuX2fzWv_JOU',
                            'lF9uzdsw7HplGLc714Tr4WO7MGJza7tt7QFleCX4Itw'
                        ],
                        type: 'VaccineRecipient'
                    },
                    type: 'VaccinationEvent',
                    vaccine: {
                        _sd: [
                            '1cF5hLwkhMNIaqfWJrXI7NMWedL-9f6Y2PA52yPjSZI',
                            'Hiy6WWueLD5bn16298tPv7GXhmldMDOTnBi-CZbphNo',
                            'Lb027q691jXXl-jC73vi8ebOj9smx3C-_og7gA4TBQE'
                        ],
                        type: 'Vaccine'
                    }
                }
            })

            assert.deepStrictEqual(
                sdJwt.disclosures?.map((d) => d.toString()),
                [
                    'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImF0Y0NvZGUiLCAiSjA3QlgwMyJd',
                    'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgIm1lZGljaW5hbFByb2R1Y3ROYW1lIiwgIkNPVklELTE5IFZhY2NpbmUgTW9kZXJuYSJd',
                    'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgIm1hcmtldGluZ0F1dGhvcml6YXRpb25Ib2xkZXIiLCAiTW9kZXJuYSBCaW90ZWNoIl0',
                    'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgIm5leHRWYWNjaW5hdGlvbkRhdGUiLCAiMjAyMS0wOC0xNlQxMzo0MDoxMloiXQ',
                    'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgImNvdW50cnlPZlZhY2NpbmF0aW9uIiwgIkdFIl0',
                    'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRhdGVPZlZhY2NpbmF0aW9uIiwgIjIwMjEtMDYtMjNUMTM6NDA6MTJaIl0',
                    'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgIm9yZGVyIiwgIjMvMyJd',
                    'WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgImdlbmRlciIsICJGZW1hbGUiXQ',
                    'WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgImJpcnRoRGF0ZSIsICIxOTYxLTA4LTE3Il0',
                    'WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgImdpdmVuTmFtZSIsICJNYXJpb24iXQ',
                    'WyI1YlBzMUlxdVpOYTBoa2FGenp6Wk53IiwgImZhbWlseU5hbWUiLCAiTXVzdGVybWFubiJd',
                    'WyI1YTJXMF9OcmxFWnpmcW1rXzdQcS13IiwgImFkbWluaXN0ZXJpbmdDZW50cmUiLCAiUHJheGlzIFNvbW1lcmdhcnRlbiJd',
                    'WyJ5MXNWVTV3ZGZKYWhWZGd3UGdTN1JRIiwgImJhdGNoTnVtYmVyIiwgIjE2MjYzODI3MzYiXQ',
                    'WyJIYlE0WDhzclZXM1FEeG5JSmRxeU9BIiwgImhlYWx0aFByb2Zlc3Npb25hbCIsICI4ODMxMTAwMDAwMTUzNzYiXQ'
                ]
            )
        })

        it('Specification: A.4.  Example 4b - W3C Verifiable Credentials Data Model v2.0 - 02', async () => {
            const compact =
                'eyJhbGciOiAiRVMyNTYifQ.eyJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLmNvbS9pc3N1ZXIiLCAiaWF0IjogMTY4MzAwMDAwMCwgImV4cCI6IDE4ODMwMDAwMDAsICJAY29udGV4dCI6IFsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCAiaHR0cHM6Ly93M2lkLm9yZy92YWNjaW5hdGlvbi92MSJdLCAidHlwZSI6IFsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCAiVmFjY2luYXRpb25DZXJ0aWZpY2F0ZSJdLCAiaXNzdWVyIjogImh0dHBzOi8vZXhhbXBsZS5jb20vaXNzdWVyIiwgImlzc3VhbmNlRGF0ZSI6ICIyMDIzLTAyLTA5VDExOjAxOjU5WiIsICJleHBpcmF0aW9uRGF0ZSI6ICIyMDI4LTAyLTA4VDExOjAxOjU5WiIsICJuYW1lIjogIkNPVklELTE5IFZhY2NpbmF0aW9uIENlcnRpZmljYXRlIiwgImRlc2NyaXB0aW9uIjogIkNPVklELTE5IFZhY2NpbmF0aW9uIENlcnRpZmljYXRlIiwgImNyZWRlbnRpYWxTdWJqZWN0IjogeyJfc2QiOiBbIjFWX0stOGxEUThpRlhCRlhiWlk5ZWhxUjRIYWJXQ2k1VDB5Ykl6WlBld3ciLCAiSnpqTGd0UDI5ZFAtQjN0ZDEyUDY3NGdGbUsyenk4MUhNdEJnZjZDSk5XZyIsICJSMmZHYmZBMDdaX1lsa3FtTlp5bWExeHl5eDFYc3RJaVM2QjFZYmwySlo0IiwgIlRDbXpybDdLMmdldl9kdTdwY01JeXpSTEhwLVllZy1GbF9jeHRyVXZQeGciLCAiVjdrSkJMSzc4VG1WRE9tcmZKN1p1VVBIdUtfMmNjN3laUmE0cVYxdHh3TSIsICJiMGVVc3ZHUC1PRERkRm9ZNE5semxYYzN0RHNsV0p0Q0pGNzVOdzhPal9nIiwgInpKS19lU01YandNOGRYbU1aTG5JOEZHTTA4ekozX3ViR2VFTUotNVRCeTAiXSwgInZhY2NpbmUiOiB7Il9zZCI6IFsiMWNGNWhMd2toTU5JYXFmV0pyWEk3Tk1XZWRMLTlmNlkyUEE1MnlQalNaSSIsICJIaXk2V1d1ZUxENWJuMTYyOTh0UHY3R1hobWxkTURPVG5CaS1DWmJwaE5vIiwgIkxiMDI3cTY5MWpYWGwtakM3M3ZpOGViT2o5c214M0MtX29nN2dBNFRCUUUiXSwgInR5cGUiOiAiVmFjY2luZSJ9LCAicmVjaXBpZW50IjogeyJfc2QiOiBbIjFsU1FCTlkyNHEwVGg2T0d6dGhxLTctNGw2Y0FheHJZWE9HWnBlV19sbkEiLCAiM256THE4MU0yb04wNndkdjFzaEh2T0VKVnhaNUtMbWREa0hFREpBQldFSSIsICJQbjFzV2kwNkc0TEpybm4tX1JUMFJiTV9IVGR4blBKUXVYMmZ6V3ZfSk9VIiwgImxGOXV6ZHN3N0hwbEdMYzcxNFRyNFdPN01HSnphN3R0N1FGbGVDWDRJdHciXSwgInR5cGUiOiAiVmFjY2luZVJlY2lwaWVudCJ9LCAidHlwZSI6ICJWYWNjaW5hdGlvbkV2ZW50In0sICJfc2RfYWxnIjogInNoYS0yNTYifQ.5jJEqiRViN_DJ4VMxHQIN4KK-Cdfn30nY3nRe5jGxS5Pths5G7mF1GWy9TawYuyFwCze7qiCIx_MhJ68Uu5zeQ~WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgIm9yZGVyIiwgIjMvMyJd~WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRhdGVPZlZhY2NpbmF0aW9uIiwgIjIwMjEtMDYtMjNUMTM6NDA6MTJaIl0~WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImF0Y0NvZGUiLCAiSjA3QlgwMyJd~WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgIm1lZGljaW5hbFByb2R1Y3ROYW1lIiwgIkNPVklELTE5IFZhY2NpbmUgTW9kZXJuYSJd~'

            const sdJwt = SdJwt.fromCompactSdJwt(compact)

            assert.deepStrictEqual(sdJwt.header, { alg: 'ES256' })

            assert.deepStrictEqual(sdJwt.payload, {
                iss: 'https://example.com/issuer',
                iat: 1683000000,
                exp: 1883000000,
                '@context': [
                    'https://www.w3.org/2018/credentials/v1',
                    'https://w3id.org/vaccination/v1'
                ],
                type: ['VerifiableCredential', 'VaccinationCertificate'],
                issuer: 'https://example.com/issuer',
                issuanceDate: '2023-02-09T11:01:59Z',
                expirationDate: '2028-02-08T11:01:59Z',
                name: 'COVID-19 Vaccination Certificate',
                description: 'COVID-19 Vaccination Certificate',
                credentialSubject: {
                    _sd: [
                        '1V_K-8lDQ8iFXBFXbZY9ehqR4HabWCi5T0ybIzZPeww',
                        'JzjLgtP29dP-B3td12P674gFmK2zy81HMtBgf6CJNWg',
                        'R2fGbfA07Z_YlkqmNZyma1xyyx1XstIiS6B1Ybl2JZ4',
                        'TCmzrl7K2gev_du7pcMIyzRLHp-Yeg-Fl_cxtrUvPxg',
                        'V7kJBLK78TmVDOmrfJ7ZuUPHuK_2cc7yZRa4qV1txwM',
                        'b0eUsvGP-ODDdFoY4NlzlXc3tDslWJtCJF75Nw8Oj_g',
                        'zJK_eSMXjwM8dXmMZLnI8FGM08zJ3_ubGeEMJ-5TBy0'
                    ],
                    vaccine: {
                        _sd: [
                            '1cF5hLwkhMNIaqfWJrXI7NMWedL-9f6Y2PA52yPjSZI',
                            'Hiy6WWueLD5bn16298tPv7GXhmldMDOTnBi-CZbphNo',
                            'Lb027q691jXXl-jC73vi8ebOj9smx3C-_og7gA4TBQE'
                        ],
                        type: 'Vaccine'
                    },
                    recipient: {
                        _sd: [
                            '1lSQBNY24q0Th6OGzthq-7-4l6cAaxrYXOGZpeW_lnA',
                            '3nzLq81M2oN06wdv1shHvOEJVxZ5KLmdDkHEDJABWEI',
                            'Pn1sWi06G4LJrnn-_RT0RbM_HTdxnPJQuX2fzWv_JOU',
                            'lF9uzdsw7HplGLc714Tr4WO7MGJza7tt7QFleCX4Itw'
                        ],
                        type: 'VaccineRecipient'
                    },
                    type: 'VaccinationEvent'
                },
                _sd_alg: 'sha-256'
            })

            assert.deepStrictEqual(
                sdJwt.disclosures?.map((d) => d.toString()),
                [
                    'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgIm9yZGVyIiwgIjMvMyJd',
                    'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRhdGVPZlZhY2NpbmF0aW9uIiwgIjIwMjEtMDYtMjNUMTM6NDA6MTJaIl0',
                    'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImF0Y0NvZGUiLCAiSjA3QlgwMyJd',
                    'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgIm1lZGljaW5hbFByb2R1Y3ROYW1lIiwgIkNPVklELTE5IFZhY2NpbmUgTW9kZXJuYSJd'
                ]
            )
        })
    })
})
