import { before, describe, it } from 'node:test'

import assert from 'node:assert'

import {
    createArrayDisclosure,
    createObjectDisclosure,
} from '../src/createDisclosure'

import { hasher, prelude } from './utils'

import { hashDisclosure } from '../src/hashDisclosure'

describe('createAndHashDisclosure', () => {
    before(prelude)

    describe('Specification Example 5.5', () => {
        it('Claim given_name', async () => {
            const disclosure = createObjectDisclosure(
                '2GLC42sKQveCfGfryNRN9w',
                'given_name',
                'John',
            )

            assert.strictEqual(
                disclosure,
                'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImdpdmVuX25hbWUiLCAiSm9obiJd',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                'jsu9yVulwQQlhFlM_3JlzMaSFzglhQG0DpfayQwLUK4',
            )
        })

        it('Claim family_name', async () => {
            const disclosure = createObjectDisclosure(
                'eluV5Og3gSNII8EYnsxA_A',
                'family_name',
                'Doe',
            )

            assert.strictEqual(
                disclosure,
                'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImZhbWlseV9uYW1lIiwgIkRvZSJd',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                'TGf4oLbgwd5JQaHyKVQZU9UdGE0w5rtDsrZzfUaomLo',
            )
        })

        it('Claim email', async () => {
            const disclosure = createObjectDisclosure(
                '6Ij7tM-a5iVPGboS5tmvVA',
                'email',
                'johndoe@example.com',
            )

            assert.strictEqual(
                disclosure,
                'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                'JzYjH4svliH0R3PyEMfeZu6Jt69u5qehZo7F7EPYlSE',
            )
        })

        it('Claim phone_number', async () => {
            const disclosure = createObjectDisclosure(
                'eI8ZWm9QnKPpNPeNenHdhQ',
                'phone_number',
                '+1-202-555-0101',
            )

            assert.strictEqual(
                disclosure,
                'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                'PorFbpKuVu6xymJagvkFsFXAbRoc2JGlAUA2BA4o7cI',
            )
        })

        it('Claim phone_number_verified', async () => {
            const disclosure = createObjectDisclosure(
                'Qg_O64zqAxe412a108iroA',
                'phone_number_verified',
                true,
            )

            assert.strictEqual(
                disclosure,
                'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgInBob25lX251bWJlcl92ZXJpZmllZCIsIHRydWVd',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                'XQ_3kPKt1XyX7KANkqVR6yZ2Va5NrPIvPYbyMvRKBMM',
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
                disclosure,
                'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                'XzFrzwscM6Gn6CJDc6vVK8BkMnfG8vOSKfpPIZdAfdE',
            )
        })

        it('Claim birthdate', async () => {
            const disclosure = createObjectDisclosure(
                'Pc33JM2LchcU_lHggv_ufQ',
                'birthdate',
                '1940-01-01',
            )

            assert.strictEqual(
                disclosure,
                'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                'gbOsI4Edq2x2Kw-w5wPEzakob9hV1cRD0ATN3oQL9JM',
            )
        })

        it('Claim updated_at', async () => {
            const disclosure = createObjectDisclosure(
                'G02NSrQfjFXQ7Io09syajA',
                'updated_at',
                1570000000,
            )

            assert.strictEqual(
                disclosure,
                'WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgInVwZGF0ZWRfYXQiLCAxNTcwMDAwMDAwXQ',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                'CrQe7S5kqBAHt-nMYXgc6bdt2SH5aTY1sU_M-PgkjPI',
            )
        })

        it('Array Entry 01', async () => {
            const disclosure = createArrayDisclosure(
                'lklxF5jMYlGTPUovMNIvCA',
                'US',
            )

            assert.strictEqual(
                disclosure,
                'WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgIlVTIl0',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                'pFndjkZ_VCzmyTa6UjlZo3dh-ko8aIKQc9DlGzhaVYo',
            )
        })

        it('Array Entry 02', async () => {
            const disclosure = createArrayDisclosure(
                'nPuoQnkRFq3BIeAm7AnXFA',
                'DE',
            )

            assert.strictEqual(
                disclosure,
                'WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgIkRFIl0',
            )

            const hash = await hashDisclosure(disclosure, hasher)

            assert.strictEqual(
                hash,
                '7Cf6JkPudry3lcbwHgeZ8khAv1U1OSlerP0VkBJrWZ0',
            )
        })
    })
})
