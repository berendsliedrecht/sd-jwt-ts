import { describe, it } from 'node:test'
import { deepStrictEqual } from 'node:assert'

import { decodeDisclosuresInPayload } from '../src/disclosures/decodePayload'

import { DisclosureWithDigest } from '@sd-jwt/types'

describe('decode disclosures in payload', () => {
    describe('decode single claim', () => {
        it('decode object single claim', () => {
            const payload = {
                _sd: ['JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E']
            }

            const disclosure = {
                encoded: '??',
                digest: 'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E',
                salt: 'salt',
                key: 'key',
                value: 'value'
            } satisfies DisclosureWithDigest

            const prettyClaims = decodeDisclosuresInPayload(payload, [
                disclosure
            ])

            deepStrictEqual(prettyClaims, { key: 'value' })
        })

        it('decode array claim', () => {
            const payload = {
                someArray: [
                    { '...': '8szvPmTqpPa0pf0YcnIJ19jGuKuFNtKYFpQatP7dXNI' }
                ]
            }

            const disclosure = {
                encoded: '??',
                digest: '8szvPmTqpPa0pf0YcnIJ19jGuKuFNtKYFpQatP7dXNI',
                salt: 'salt',
                value: 'value'
            } satisfies DisclosureWithDigest

            const prettyClaims = decodeDisclosuresInPayload(payload, [
                disclosure
            ])

            deepStrictEqual(prettyClaims, { someArray: ['value'] })
        })

        it('should not decode claim that is not in the object', () => {
            const payload = {
                _sd: ['abba']
            }

            const disclosure = {
                encoded: '??',
                digest: 'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E',
                salt: 'salt',
                key: 'key',
                value: 'value'
            } satisfies DisclosureWithDigest

            const prettyClaims = decodeDisclosuresInPayload(payload, [
                disclosure
            ])

            deepStrictEqual(prettyClaims, {})
        })

        it('should not decode claim that is not in the object, but only ones that work', () => {
            const payload = {
                _sd: ['abba', 'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E']
            }

            const disclosure = {
                encoded: '??',
                digest: 'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E',
                salt: 'salt',
                key: 'key',
                value: 'value'
            } satisfies DisclosureWithDigest

            const prettyClaims = decodeDisclosuresInPayload(payload, [
                disclosure
            ])
            deepStrictEqual(prettyClaims, { key: 'value' })
        })
    })

    describe('decode multiple claims', () => {
        it('decode object multiple claim', () => {
            const payload = {
                _sd: [
                    'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E',
                    'svTQmxMQAojzr63PVqHXnIUxqxyo-sHDzAMnLcKjKRs'
                ]
            }

            const disclosureOne = {
                encoded: '??',
                digest: 'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E',
                salt: 'salt',
                key: 'key',
                value: 'value'
            } satisfies DisclosureWithDigest

            const disclosureTwo = {
                encoded: '??',
                digest: 'svTQmxMQAojzr63PVqHXnIUxqxyo-sHDzAMnLcKjKRs',
                salt: 'salt',
                key: 'keyTwo',
                value: { hello: 'world' }
            } satisfies DisclosureWithDigest

            const prettyClaims = decodeDisclosuresInPayload(payload, [
                disclosureOne,
                disclosureTwo
            ])
            deepStrictEqual(prettyClaims, {
                key: 'value',
                keyTwo: { hello: 'world' }
            })
        })

        it('decode multiple array claims', () => {
            const payload = {
                someArray: [
                    { '...': '8szvPmTqpPa0pf0YcnIJ19jGuKuFNtKYFpQatP7dXNI' },
                    { '...': 'w9JvA2goSCRDWdWqyRHB9WfmK23_txf2qq6P_Vv77Xk' }
                ]
            }

            const disclosureOne = {
                encoded: '??',

                digest: '8szvPmTqpPa0pf0YcnIJ19jGuKuFNtKYFpQatP7dXNI',
                salt: 'salt',
                value: 'value'
            } satisfies DisclosureWithDigest

            const disclosureTwo = {
                encoded: '??',
                digest: 'w9JvA2goSCRDWdWqyRHB9WfmK23_txf2qq6P_Vv77Xk',
                salt: 'salt',
                value: { hello: 'world' }
            } satisfies DisclosureWithDigest

            const prettyClaims = decodeDisclosuresInPayload(payload, [
                disclosureOne,
                disclosureTwo
            ])
            deepStrictEqual(prettyClaims, {
                someArray: ['value', { hello: 'world' }]
            })
        })

        it('decode complex nested disclosures', () => {
            const payload = {
                cleartextclaim: true,
                _sd: ['g8mHOW_TLNiLKUpGdKmc7Lsh6CYaU2mtgk1-5eSjglg'],
                nested: {
                    nestedcleartextclaim: ['hello', 'world'],
                    _sd: ['9mR4VRAMdShEDAt_dN1XWXQuccfoByCFiVCxcJBDQz8'],
                    moreNested: [
                        'a',
                        { '...': 'jCSRikjCOQNQreSSGj-fpjPJ4ENtBVhriC5i8CuyjNo' }
                    ]
                },
                _sd_alg: 'sha-256'
            }
            const disclosureOne = {
                encoded: '??',

                digest: 'g8mHOW_TLNiLKUpGdKmc7Lsh6CYaU2mtgk1-5eSjglg',
                salt: 'salt',
                key: 'toplevelkey',
                value: 'toplevel'
            } satisfies DisclosureWithDigest

            const disclosureTwo = {
                encoded: '??',

                digest: '9mR4VRAMdShEDAt_dN1XWXQuccfoByCFiVCxcJBDQz8',
                salt: 'salt',
                key: 'nestedkey',
                value: 'nested'
            } satisfies DisclosureWithDigest

            const disclosureThree = {
                encoded: '??',
                digest: 'jCSRikjCOQNQreSSGj-fpjPJ4ENtBVhriC5i8CuyjNo',
                salt: 'salt',
                value: 'arrayitem'
            } satisfies DisclosureWithDigest

            const prettyClaims = decodeDisclosuresInPayload(payload, [
                disclosureOne,
                disclosureTwo,
                disclosureThree
            ])

            deepStrictEqual(prettyClaims, {
                cleartextclaim: true,
                toplevelkey: 'toplevel',
                nested: {
                    nestedkey: 'nested',
                    nestedcleartextclaim: ['hello', 'world'],
                    moreNested: ['a', 'arrayitem']
                }
            })
        })
    })
})
