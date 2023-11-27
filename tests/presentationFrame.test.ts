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
        const requiredDisclosures = await getDisclosuresForPresentationFrame(
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
            (data) => Buffer.from(data),
            disclosures
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
                        '...': 'V3lKellXeDBJaXdnVzNzaUxpNHVJam9nSWxZemJFdGxiR3hZWlVSQ1NtRllaRzVUVnpGSFpWZE9kRkpxVmxsbGEwcHRXa2N4UjJNeVVsaFdiVnBPVW1wcmVWZFdaRFJOVm5CVVUyMVJJbjFkWFE'
                    },
                    'array_1_value'
                ]
            ]),
            Disclosure.fromArray([
                'salt',
                [
                    {
                        '...': 'V3lKellXeDBJaXdnSW1GeWNtRjVYekJmZG1Gc2RXVmZNRjkyWVd4MVpTSmQ'
                    }
                ]
            ]),
            Disclosure.fromArray(['salt', 'array_0_value_0_value'])
        ]

        const requiredDisclosures = await getDisclosuresForPresentationFrame(
            {
                _sd: [
                    'V3lKellXeDBJaXdnSW1GeWNtRjVJaXdnVzNzaUxpNHVJam9nSWxZemJFdGxiR3hZWlVSQ1NtRllaRzVXZWs1NllWVjRjRTVJVmtwaGJUbHVVMWQ0V21WdFNrWmtSM2hwVWpOb1dsZHNWbE5STVU1MFVteHNZVko2VmxWV2JuQkhVMFp3VjFwRk9XdFNhM0I0Vm0xNGMySkhSWGRqU0ZKWVlUSk9ORlZxU2s1bFZsWnpZVVprYVZadVFsQldWekYzWTIxV1YxcEdaR0ZTUmtwUFZtMDFRMVpXVlhsTlZrcEtZbXBHYTFkR1JTSjlMQ0poY25KaGVWOHhYM1poYkhWbElsMWQ'
                ]
            },
            {
                array: [true]
            },
            {
                array: [['array_0_value_0_value'], 'array_1_value']
            },
            (data) => Buffer.from(data),
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
        const disclosures = sdJwt.disclosures!

        await assert.rejects(
            getDisclosuresForPresentationFrame(
                sdJwt.payload!,
                {
                    // @ts-ignore
                    nested_field: [true]
                },
                await sdJwt.getPrettyClaims(),
                (data) => Buffer.from(data),
                disclosures
            ),
            'Path nested_field.0 from presentation frame is not present in pretty SD-JWT payload.'
        )
    })
})
