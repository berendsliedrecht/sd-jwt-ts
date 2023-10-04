import { describe, it } from 'node:test'

import assert from 'node:assert'

import {
    createArrayDisclosure,
    createObjectDisclosure,
} from '../src/createDisclosure'
import { c14n } from './utils'

describe('createDisclosure', () => {
    describe('Specification Example 5.5', () => {
        it('Claim given_name', async () => {
            const disclosure = createObjectDisclosure(
                '2GLC42sKQveCfGfryNRN9w',
                'given_name',
                'John',
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n(
                    'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImdpdmVuX25hbWUiLCAiSm9obiJd',
                ),
            )
        })

        it('Claim family_name', async () => {
            const disclosure = createObjectDisclosure(
                'eluV5Og3gSNII8EYnsxA_A',
                'family_name',
                'Doe',
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n(
                    'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImZhbWlseV9uYW1lIiwgIkRvZSJd',
                ),
            )
        })

        it('Claim email', async () => {
            const disclosure = createObjectDisclosure(
                '6Ij7tM-a5iVPGboS5tmvVA',
                'email',
                'johndoe@example.com',
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n(
                    'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ',
                ),
            )
        })

        it('Claim phone_number', async () => {
            const disclosure = createObjectDisclosure(
                'eI8ZWm9QnKPpNPeNenHdhQ',
                'phone_number',
                '+1-202-555-0101',
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n(
                    'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ',
                ),
            )
        })
        it('Claim phone_number_verified', async () => {
            const disclosure = createObjectDisclosure(
                'Qg_O64zqAxe412a108iroA',
                'phone_number_verified',
                true,
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n(
                    'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgInBob25lX251bWJlcl92ZXJpZmllZCIsIHRydWVd',
                ),
            )
        })

        it('Claim address', async () => {
            const disclosure = createObjectDisclosure(
                'AJx-095VPrpTtN4QMOqROA',
                'address',
                {
                    street_address: '123 Main St',
                    locality: 'Anytown',
                    region: 'Anystate',
                    country: 'US',
                },
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n(
                    'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0',
                ),
            )
        })

        it('Claim birthdate', async () => {
            const disclosure = createObjectDisclosure(
                'Pc33JM2LchcU_lHggv_ufQ',
                'birthdate',
                '1940-01-01',
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n(
                    'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0',
                ),
            )
        })

        it('Claim updated_at', async () => {
            const disclosure = createObjectDisclosure(
                'G02NSrQfjFXQ7Io09syajA',
                'updated_at',
                1570000000,
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n(
                    'WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgInVwZGF0ZWRfYXQiLCAxNTcwMDAwMDAwXQ',
                ),
            )
        })

        it('Array Entry 01', async () => {
            const disclosure = createArrayDisclosure(
                'lklxF5jMYlGTPUovMNIvCA',
                'US',
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n('WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgIlVTIl0'),
            )
        })

        it('Array Entry 02', async () => {
            const disclosure = createArrayDisclosure(
                'nPuoQnkRFq3BIeAm7AnXFA',
                'DE',
            )

            assert.strictEqual(
                c14n(disclosure),
                c14n('WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgIkRFIl0'),
            )
        })
    })
})
