import { describe, it } from 'node:test'
import assert from 'node:assert'
import { SdJwt, SdJwtError } from '../src'
import { HasherAlgorithm } from '../src/hasherAlgorithm'
import { Buffer } from 'buffer'

describe('sd-jwt', () => {
  describe('JWT without selective disclosure', () => {
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
        .addHeaderClaim('kid', 'a')
        .addPayloadClaim('exp', 123)
        .withSignature(Uint8Array.from([1, 2, 3]))
        .toCompact()

      assert.deepStrictEqual(sdJwt, 'eyJraWQiOiJhIn0.eyJleHAiOjEyM30.AQID')
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

  describe('JWT assert correct methods', () => {
    it('should error when creating compact format without header', () => {
      const sdJwt = new SdJwt()
        .addPayloadClaim('exp', 123)
        .withSignature(Uint8Array.from([1, 2, 3]))

      assert.throws(
        () => sdJwt.toCompact(),
        new SdJwtError('Header must be defined')
      )
    })

    it('should error when creating compact format without payload', () => {
      const sdJwt = new SdJwt()
        .addHeaderClaim('kid', 'a')
        .withSignature(Uint8Array.from([1, 2, 3]))

      assert.throws(
        () => sdJwt.toCompact(),
        new SdJwtError('Payload must be defined')
      )
    })

    it('should error when verifying the signature without a signature', () => {
      const sdJwt = new SdJwt()
        .addHeaderClaim('kid', 'a')
        .addPayloadClaim('some', 'claim')

      assert.throws(
        () => sdJwt.verifySignature(() => true),
        new SdJwtError('Signature must be defined')
      )
    })

    it('should error when no salt method is provided', () => {
      assert.throws(
        () =>
          new SdJwt(
            {
              header: { kid: 'a' },
              payload: { exp: 123, sub: 'a' },
              signature: Uint8Array.from([1, 2, 3]),
            },
            { disclosureFrame: { sub: true } }
          ).toCompact(),
        new SdJwtError(
          'Cannot create a disclosure without a salt generator. You can set it with this.withSaltGenerator()'
        )
      )
    })

    it('should error when no hash method is provided', () => {
      assert.throws(
        () =>
          new SdJwt(
            {
              header: { kid: 'a' },
              payload: { exp: 123, sub: 'a' },
              signature: Uint8Array.from([1, 2, 3]),
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

    it('should error when no signer method is provided', () => {
      assert.throws(
        () =>
          new SdJwt(
            {
              header: { kid: 'a' },
              payload: { exp: 123, sub: 'a' },
              signature: Uint8Array.from([1, 2, 3]),
            },
            { disclosureFrame: { sub: true } }
          ).signAndAdd(),
        new SdJwtError(
          'A signer must be provided to create a signature. You can set it with this.withSigner()'
        )
      )
    })
  })

  describe('JWT with selective disclosure', () => {
    it('should create a SD-JWT from the specification', () => {
      const expected =
        'eyJhbGciOiJFUzI1NiJ9.eyJfc2RfYWxnIjoic2hhLTI1NiIsImlzcyI6Imh0dHBzOi8vZXhhbXBsZS5jb20vaXNzdWVyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODk2NjEsImNuZiI6eyJqd2siOnsia3R5IjoiRUMiLCJjcnYiOiJQLTI1NiIsIngiOiJUQ0FFUjE5WnZ1M09IRjRqNFc0dmZTVm9ISVAxSUxpbERsczd2Q2VHZW1jIiwieSI6Ilp4amlXV2JaTVFHSFZXS1ZRNGhiU0lpcnNWZnVlY0NFNnQ0alQ5RjJIWlEifX0sIl9zZCI6WyI1blh5MFozUWlFYmExVjFsSnplS2hBT0dRWEZsS0xJV0NMbGhmX08tY21vIiwiOWdaaEhBaFY3TFpuT0ZacV9xN0ZoOHJ6ZHFyck5NLWhSV3NWT2xXM251dyIsIlMtSlBCU2t2cWxpRnYxX190aHVYdDNJelg1Ql9aWG00VzJxczRCb05GckEiLCJidml3N3BXQWtiekkwNzhaTlZhX2VNWnZrMHRkUGE1dzJvOVIzWnljam80Iiwiby1MQkNEckZGNnRDOWV3MXZBbFVtdzZZMzBDSFpGNWpPVUZocHg1bW9nSSIsInB6a0hJTTlzdjdvWkg2WUtEc1JxTmdGR0xwRUtJajNjNUc2VUthVHNBalEiLCJybkF6Q1Q2RFR5NFRzWDlRQ0R2Mnd3QUU0WmUyMHVSaWd0Vk5Ra0E1MlgwIl19.D7zXHQgMeeBXNTiCmfq1SVRkixyj4mpZoxCLcuibWxa_eixmr5B-g-DPAY93k2rs1-PqSD5aKrqwHsrg_p2lRw~WyJOYTNWb0ZGblZ3MjhqT0FyazdJTlZnIiwiYWRkcmVzcyIseyJzdHJlZXRfYWRkcmVzcyI6IjEyMyBNYWluIFN0IiwibG9jYWxpdHkiOiJBbnl0b3duIiwicmVnaW9uIjoiQW55c3RhdGUiLCJjb3VudHJ5IjoiVVMifV0~WyJyU0x1em5oaUxQQkRSWkUxQ1o4OEtRIiwic3ViIiwiam9obl9kb2VfNDIiXQ~WyJkQW9mNHNlZTFGdDBXR2dHanVjZ2pRIiwiYmlydGhkYXRlIiwiMTk0MC0wMS0wMSJd~WyJhYTFPYmdlUkJnODJudnpMYnRQTklRIiwiZ2l2ZW5fbmFtZSIsIkpvaG4iXQ~WyJ2S0t6alFSOWtsbFh2OWVkNUJ1ZHZRIiwiZW1haWwiLCJqb2huZG9lQGV4YW1wbGUuY29tIl0~WyI2VWhsZU5HUmJtc0xDOFRndTh2OFdnIiwiZmFtaWx5X25hbWUiLCJEb2UiXQ~WyJVZEVmXzY0SEN0T1BpZDRFZmhPQWNRIiwicGhvbmVfbnVtYmVyIiwiKzEtMjAyLTU1NS0wMTAxIl0~'

      const sdJwt = new SdJwt(
        {
          header: { alg: 'ES256' },
          payload: {
            iss: 'https://example.com/issuer',
            iat: 1516239022,
            exp: 1735689661,
            cnf: {
              jwk: {
                kty: 'EC',
                crv: 'P-256',
                x: 'TCAER19Zvu3OHF4j4W4vfSVoHIP1ILilDls7vCeGemc',
                y: 'ZxjiWWbZMQGHVWKVQ4hbSIirsVfuecCE6t4jT9F2HZQ',
              },
            },
            address: {
              street_address: '123 Main St',
              locality: 'Anytown',
              region: 'Anystate',
              country: 'US',
            },
            phone_number: '+1-202-555-0101',
            given_name: 'John',
            email: 'johndoe@example.com',
            family_name: 'Doe',
            sub: 'john_doe_42',
            birthdate: '1940-01-01',
          },
          signature: Buffer.from(
            'D7zXHQgMeeBXNTiCmfq1SVRkixyj4mpZoxCLcuibWxa_eixmr5B-g-DPAY93k2rs1-PqSD5aKrqwHsrg_p2lRw',
            'base64url'
          ),
        },
        {
          disclosureFrame: {
            address: true,
            sub: true,
            birthdate: true,
            given_name: true,
            email: true,
            family_name: true,
            phone_number: true,
          },
          saltGenerator: (key: string) => {
            if (key === 'sub') {
              return 'rSLuznhiLPBDRZE1CZ88KQ'
            }
            if (key === 'given_name') {
              return 'aa1ObgeRBg82nvzLbtPNIQ'
            }
            if (key === 'email') {
              return 'vKKzjQR9kllXv9ed5BudvQ'
            }
            if (key === 'phone_number') {
              return 'UdEf_64HCtOPid4EfhOAcQ'
            }
            if (key === 'address') {
              return 'Na3VoFFnVw28jOArk7INVg'
            }
            if (key === 'birthdate') {
              return 'dAof4see1Ft0WGgGjucgjQ'
            }
            if (key === 'family_name') {
              return '6UhleNGRbmsLC8Tgu8v8Wg'
            }

            return ''
          },
          hasherAndAlgorithm: {
            algorithm: HasherAlgorithm.Sha256,
            hasher: (disclosure: string) => {
              const key = Buffer.from(disclosure, 'base64url').toString()
              if (key.includes('sub')) {
                return 'pzkHIM9sv7oZH6YKDsRqNgFGLpEKIj3c5G6UKaTsAjQ'
              }
              if (key.includes('given_name')) {
                return 'S-JPBSkvqliFv1__thuXt3IzX5B_ZXm4W2qs4BoNFrA'
              }
              if (key.includes('family_name')) {
                return 'o-LBCDrFF6tC9ew1vAlUmw6Y30CHZF5jOUFhpx5mogI'
              }
              if (key.includes('email')) {
                return 'bviw7pWAkbzI078ZNVa_eMZvk0tdPa5w2o9R3Zycjo4'
              }
              if (key.includes('phone_number')) {
                return '9gZhHAhV7LZnOFZq_q7Fh8rzdqrrNM-hRWsVOlW3nuw'
              }
              if (key.includes('address')) {
                return '5nXy0Z3QiEba1V1lJzeKhAOGQXFlKLIWCLlhf_O-cmo'
              }
              if (key.includes('birthdate')) {
                return 'rnAzCT6DTy4TsX9QCDv2wwAE4Ze20uRigtVNQkA52X0'
              }

              return ''
            },
          },
        }
      ).toCompact()

      assert.strictEqual(sdJwt, expected)
    })
  })
})
