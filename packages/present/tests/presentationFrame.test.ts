import assert, { deepStrictEqual } from 'node:assert'
import { before, describe, it } from 'node:test'

import { prelude } from '../../core/tests/utils'

import { getDisclosuresForPresentationFrame } from '../src'
import { SdJwt } from '../../core/src'
import { DisclosureWithDigest, HasherAlgorithm } from '@sd-jwt/types'

describe('presentationFrame', async () => {
    before(prelude)

    it('disclosure', async () => {
        const sdJwt = new SdJwt(
            {
                header: { alg: 'EdDSA' },
                payload: {
                    iss: 'https://example.org/issuer',
                    nested_field: {
                        more_nested_field: { a: [1, 2, 3, 4] }
                    },
                    credential: {
                        firstName: 'John',
                        lastName: 'Doe',
                        ageOver18: true,
                        ageOver21: true,
                        ageOver65: false
                    },
                    mustDiscloseWholeObject: {
                        ifYouWantToDisclose: 'thisKey'
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
                        more_nested_field: { a: [true, true, false, true] },
                        __decoyCount: 5
                    },
                    credential: {
                        ageOver18: true,
                        ageOver21: true,
                        ageOver65: true,
                        firstName: true,
                        lastName: true
                    },
                    mustDiscloseWholeObject: true
                },
                hasherAndAlgorithm: {
                    hasher: (data) => Buffer.from(data),
                    algorithm: HasherAlgorithm.Sha256
                }
            }
        )

        // NOTE: we need to apply the disclosure frame, otherwise payload is the input payload
        await sdJwt.applyDisclosureFrame()
        const disclosures = sdJwt.disclosures!

        const disclosuresWithDigest = await Promise.all(
            disclosures.map((d) =>
                d.withCalculateDigest({
                    hasher: (data) => Buffer.from(data),
                    algorithm: HasherAlgorithm.Sha256
                })
            )
        )

        const jsonDisclosures = disclosuresWithDigest.map((d) => d.asJson())
        const requiredDisclosures = getDisclosuresForPresentationFrame(
            sdJwt.payload!,
            {
                nested_field: {
                    more_nested_field: { a: [true, false, false, true] }
                },
                credential: {
                    ageOver21: true,
                    firstName: true,
                    lastName: true
                },
                mustDiscloseWholeObject: true
            },
            await sdJwt.getPrettyClaims(),
            jsonDisclosures
        )

        deepStrictEqual(requiredDisclosures, [
            jsonDisclosures[1],
            jsonDisclosures[3],
            jsonDisclosures[5],
            jsonDisclosures[7],
            jsonDisclosures[8],
            jsonDisclosures[9]
        ])
    })

    it('arrays and nested arrays', async () => {
        const disclosures = [
            {
                salt: 'salt',
                key: 'array',
                value: [
                    {
                        '...': 'array_0_value_digest'
                    },
                    'array_1_value'
                ],
                digest: 'array_digest',
                encoded: ''
            },
            {
                salt: 'salt',
                digest: 'array_0_value_digest',
                value: [
                    {
                        '...': 'array_0_value_0_value_digest'
                    }
                ],
                encoded: ''
            },
            {
                salt: 'salt',
                value: 'array_0_value_0_value',
                digest: 'array_0_value_0_value_digest',
                encoded: ''
            }
        ] satisfies DisclosureWithDigest[]

        const requiredDisclosures = getDisclosuresForPresentationFrame(
            {
                _sd: ['array_digest']
            },
            {
                array: [true]
            },
            {
                array: [['array_0_value_0_value'], 'array_1_value']
            },
            disclosures
        )

        deepStrictEqual(
            requiredDisclosures.map((d) => d.digest).sort(),
            disclosures.map((d) => d.digest).sort()
        )
    })

    it('error when presentation frame does not match payload structure', async () => {
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
                        more_nested_field: { a: [true, true, false, true] },
                        __decoyCount: 5
                    }
                },
                hasherAndAlgorithm: {
                    hasher: (data) => Buffer.from(data),
                    algorithm: HasherAlgorithm.Sha256
                }
            }
        )

        // NOTE: we need to apply the disclosure frame, otherwise payload is the input payload
        await sdJwt.applyDisclosureFrame()
        const disclosures = await Promise.all(
            sdJwt.disclosures!.map((d) =>
                d.withCalculateDigest({
                    hasher: (data) => Buffer.from(data),
                    algorithm: HasherAlgorithm.Sha256
                })
            )
        )
        const prettyClaims = await sdJwt.getPrettyClaims()

        assert.throws(
            () =>
                getDisclosuresForPresentationFrame(
                    sdJwt.payload!,
                    {
                        // @ts-ignore
                        nested_field: [true]
                    },
                    prettyClaims,
                    disclosures.map((d) => d.asJson())
                ),
            'Path nested_field.0 from presentation frame is not present in pretty SD-JWT payload.'
        )
    })
})
