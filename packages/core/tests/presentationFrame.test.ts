import assert, { deepStrictEqual } from 'node:assert'
import { before, describe, it } from 'node:test'

import { prelude } from './utils'

import { getDisclosuresForPresentationFrame } from '../src/sdJwt/presentationFrame'
import { Disclosure, HasherAlgorithm, SdJwt } from '../src'

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
            disclosures.map((d) => d.withCalculateDigest(Buffer.from))
        )
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
            disclosuresWithDigest
        )

        deepStrictEqual(requiredDisclosures, [
            disclosures[1],
            disclosures[3],
            disclosures[5],
            disclosures[7],
            disclosures[8],
            disclosures[9]
        ])
    })

    it('arrays and nested arrays', async () => {
        const disclosures = [
            Disclosure.fromArray([
                'salt',
                'array',
                [
                    {
                        '...': 'array_0_value_digest'
                    },
                    'array_1_value'
                ]
            ]).withDigest('array_digest'),
            Disclosure.fromArray([
                'salt',
                [
                    {
                        '...': 'array_0_value_0_value_digest'
                    }
                ]
            ]).withDigest('array_0_value_digest'),
            Disclosure.fromArray(['salt', 'array_0_value_0_value']).withDigest(
                'array_0_value_0_value_digest'
            )
        ]

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
            [...requiredDisclosures].sort(),
            [...disclosures].sort()
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
            sdJwt.disclosures!.map((d) => d.withCalculateDigest(Buffer.from))
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
                    disclosures
                ),
            'Path nested_field.0 from presentation frame is not present in pretty SD-JWT payload.'
        )
    })
})
