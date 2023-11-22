import { deepStrictEqual } from 'node:assert'
import { before, describe, it } from 'node:test'

import { prelude } from './utils'

import { getDisclosuresForPresentationFrame } from '../src/sdJwt/presentationFrame'
import { HasherAlgorithm, SdJwt } from '../src'

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
})
