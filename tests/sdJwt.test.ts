import { describe, it } from 'node:test'
import assert from 'node:assert'
import { SdJwt, SdJwtError } from '../src'

describe('sd-jwt', () => {
  it('should create a simple jwt', () => {
    const sdJwt = new SdJwt({
      header: { kid: 'a' },
      payload: { exp: 123 },
      signature: Uint8Array.from([1, 2, 3]),
    }).toCompact()

    assert.deepStrictEqual(sdJwt, 'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID')
  })

  it('should create a simple jwt with builder', () => {
    const sdJwt = new SdJwt()
      .withHeader({ kid: 'a' })
      .withPayload({ exp: 123 })
      .withSignature(Uint8Array.from([1, 2, 3]))
      .toCompact()

    assert.deepStrictEqual(sdJwt, 'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID')
  })

  it('should create a simple jwt with builder', () => {
    const sdJwt = new SdJwt()
      .withHeader({ kid: 'a' })
      .withPayload({ exp: 123 })
      .withSignature(Uint8Array.from([1, 2, 3]))
      .toCompact()

    assert.deepStrictEqual(sdJwt, 'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID')
  })

  it('should create a simple jwt with add builder', () => {
    const sdJwt = new SdJwt()
      .addHeader('kid', 'a')
      .addPayload('exp', 123)
      .withSignature(Uint8Array.from([1, 2, 3]))
      .toCompact()

    assert.deepStrictEqual(sdJwt, 'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID')
  })

  it('should error when creating compact format without header', () => {
    const sdJwt = new SdJwt()
      .addPayload('exp', 123)
      .withSignature(Uint8Array.from([1, 2, 3]))

    assert.throws(() => sdJwt.toCompact(), SdJwtError)
  })

  it('should error when creating compact format without payload', () => {
    const sdJwt = new SdJwt()
      .addHeader('kid', 'a')
      .withSignature(Uint8Array.from([1, 2, 3]))

    assert.throws(() => sdJwt.toCompact(), SdJwtError)
  })

  it('should create an instance of sdJwt from a compact sdJwt', () => {
    const sdJwt = SdJwt.fromCompact<{ kid: string }, { exp: number }>(
      'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID'
    )

    assert.deepStrictEqual(sdJwt.header?.kid, 'a')
    assert.deepStrictEqual(sdJwt.payload?.exp, 123)
    assert.deepStrictEqual(sdJwt.signature, Uint8Array.from([1, 2, 3]))
  })

  it('should create an instance of sdJwt from a compact sdJwt with disclosable', () => {
    const sdJwt = SdJwt.fromCompact<{ kid: string }, { exp: number }>(
      'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID~AQID'
    )

    assert.deepStrictEqual(sdJwt.header?.kid, 'a')
    assert.deepStrictEqual(sdJwt.payload?.exp, 123)
    assert.deepStrictEqual(sdJwt.signature, Uint8Array.from([1, 2, 3]))
  })
})
