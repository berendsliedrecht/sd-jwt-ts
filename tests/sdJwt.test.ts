import { describe, it } from 'node:test'
import assert from 'node:assert'
import { SdJwt, SdJwtError } from '../src'

describe('sd-jwt', async () => {
    describe('JWT without selective disclosure', async () => {
        it('should create a simple jwt', async () => {
            const sdJwt = await new SdJwt({
                header: { kid: 'a' },
                payload: { exp: 123 },
                signature: Uint8Array.from([1, 2, 3])
            }).toCompact()

            assert.deepStrictEqual(
                sdJwt,
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID'
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
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID'
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
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID'
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
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID'
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
            const sdJwt = SdJwt.fromCompact<{ kid: string }, { exp: number }>(
                'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID~AQID'
            )

            assert.deepStrictEqual(sdJwt.header.kid, 'a')
            assert.deepStrictEqual(sdJwt.payload.exp, 123)
            assert.deepStrictEqual(sdJwt.signature, Uint8Array.from([1, 2, 3]))
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
                        { disclosureFrame: { sub: true } }
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
})
