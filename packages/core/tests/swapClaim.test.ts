import { describe, it } from 'node:test'
import { deepStrictEqual } from 'node:assert'

import { Disclosure, SdJwt } from '../src'

import { swapClaims } from '../src/sdJwt/swapClaim'

import { hasherAndAlgorithm, saltGenerator, signer } from './utils'

describe('swap claims', async () => {
    describe('swap single claim', async () => {
        it('swap object single claim', async () => {
            const payload = {
                _sd: ['JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E']
            }

            const disclosure = new Disclosure('salt', 'value', 'key')

            const prettyClaims = await swapClaims(
                hasherAndAlgorithm.hasher,
                payload,
                [disclosure]
            )

            deepStrictEqual(prettyClaims, { key: 'value' })
        })

        it('swap array claim', async () => {
            const payload = {
                someArray: [
                    { '...': '8szvPmTqpPa0pf0YcnIJ19jGuKuFNtKYFpQatP7dXNI' }
                ]
            }

            const disclosure = new Disclosure('salt', 'value')

            const prettyClaims = await swapClaims(
                hasherAndAlgorithm.hasher,
                payload,
                [disclosure]
            )

            deepStrictEqual(prettyClaims, { someArray: ['value'] })
        })

        it('should not swap claim that is not in the object', async () => {
            const payload = {
                _sd: ['abba']
            }

            const disclosure = new Disclosure('salt', 'value', 'key')

            const prettyClaims = await swapClaims(
                hasherAndAlgorithm.hasher,
                payload,
                [disclosure]
            )

            deepStrictEqual(prettyClaims, {})
        })

        it('should not swap claim that is not in the object, but only ones that work', async () => {
            const payload = {
                _sd: ['abba', 'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E']
            }

            const disclosure = new Disclosure('salt', 'value', 'key')

            const prettyClaims = await swapClaims(
                hasherAndAlgorithm.hasher,
                payload,
                [disclosure]
            )
            deepStrictEqual(prettyClaims, { key: 'value' })
        })
    })

    describe('swap multiple claims', async () => {
        it('swap object multiple claim', async () => {
            const payload = {
                _sd: [
                    'JP2SEOtk1Nn7dVSy3KWgE51k4m5i22GfYw_FHr1Qq2E',
                    'svTQmxMQAojzr63PVqHXnIUxqxyo-sHDzAMnLcKjKRs'
                ]
            }
            const disclosureOne = new Disclosure('salt', 'value', 'key')
            const disclosureTwo = new Disclosure(
                'salt',
                { hello: 'world' },
                'keyTwo'
            )

            const prettyClaims = await swapClaims(
                hasherAndAlgorithm.hasher,
                payload,
                [disclosureOne, disclosureTwo]
            )
            deepStrictEqual(prettyClaims, {
                key: 'value',
                keyTwo: { hello: 'world' }
            })
        })

        it('swap multiple array claims', async () => {
            const payload = {
                someArray: [
                    { '...': '8szvPmTqpPa0pf0YcnIJ19jGuKuFNtKYFpQatP7dXNI' },
                    { '...': 'w9JvA2goSCRDWdWqyRHB9WfmK23_txf2qq6P_Vv77Xk' }
                ]
            }
            const disclosureOne = new Disclosure('salt', 'value')
            const disclosureTwo = new Disclosure('salt', { hello: 'world' })

            const prettyClaims = await swapClaims(
                hasherAndAlgorithm.hasher,
                payload,
                [disclosureOne, disclosureTwo]
            )
            deepStrictEqual(prettyClaims, {
                someArray: ['value', { hello: 'world' }]
            })
        })

        it('swap complex nested disclosures', async () => {
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
            const disclosureOne = new Disclosure(
                'salt',
                'toplevel',
                'toplevelkey'
            )
            const disclosureTwo = new Disclosure('salt', 'nested', 'nestedkey')
            const disclosureThree = new Disclosure('salt', 'arrayitem')

            const prettyClaims = await swapClaims(
                hasherAndAlgorithm.hasher,
                payload,
                [disclosureOne, disclosureTwo, disclosureThree]
            )

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

    describe('Roundtrip', async () => {
        it('should roundtrip from and to pretty claims', async () => {
            const prettyClaims = {
                cleartext: 123,
                hello: 'world',
                nested: {
                    nestedField: true,
                    nestedArray: ['1', '2', '3']
                }
            }

            const sdJwt = new SdJwt(
                {
                    header: { alg: 'EdDSA' },
                    payload: prettyClaims
                },
                {
                    disclosureFrame: {
                        hello: true,
                        __decoyCount: 3,
                        nested: {
                            nestedArray: [true, false, true],
                            nestedField: true
                        }
                    },
                    signer,
                    saltGenerator,
                    hasherAndAlgorithm
                }
            )
            await sdJwt.applyDisclosureFrame()

            const disclosures = sdJwt.disclosures ?? []
            const sdPayload = sdJwt.payload ?? {}

            const receivedPrettyClaims = await swapClaims(
                hasherAndAlgorithm.hasher,
                sdPayload,
                disclosures
            )

            deepStrictEqual(receivedPrettyClaims, {
                cleartext: 123,
                hello: 'world',
                nested: {
                    nestedField: true,
                    nestedArray: ['1', '2', '3']
                }
            })
        })
    })
})
