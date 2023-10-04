import { before, describe, it } from 'node:test'

import {
    prelude,
    testCreateDisclosureArrayAndHash,
    testCreateDisclosureObjectAndHash,
} from './utils'

describe('createAndHashDisclosure', () => {
    before(prelude)

    describe('Specification: 5.5', () => {
        it('Claim given_name', async () => {
            testCreateDisclosureObjectAndHash(
                ['2GLC42sKQveCfGfryNRN9w', 'given_name', 'John'],
                'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImdpdmVuX25hbWUiLCAiSm9obiJd',
                'jsu9yVulwQQlhFlM_3JlzMaSFzglhQG0DpfayQwLUK4'
            )
        })

        it('Claim family_name', async () => {
            testCreateDisclosureObjectAndHash(
                ['eluV5Og3gSNII8EYnsxA_A', 'family_name', 'Doe'],
                'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImZhbWlseV9uYW1lIiwgIkRvZSJd',
                'TGf4oLbgwd5JQaHyKVQZU9UdGE0w5rtDsrZzfUaomLo'
            )
        })

        it('Claim email', async () => {
            testCreateDisclosureObjectAndHash(
                ['6Ij7tM-a5iVPGboS5tmvVA', 'email', 'johndoe@example.com'],
                'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ',
                'JzYjH4svliH0R3PyEMfeZu6Jt69u5qehZo7F7EPYlSE'
            )
        })

        it('Claim phone_number', async () => {
            testCreateDisclosureObjectAndHash(
                ['eI8ZWm9QnKPpNPeNenHdhQ', 'phone_number', '+1-202-555-0101'],
                'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ',
                'PorFbpKuVu6xymJagvkFsFXAbRoc2JGlAUA2BA4o7cI'
            )
        })

        it('Claim phone_number_verified', async () => {
            testCreateDisclosureObjectAndHash(
                ['Qg_O64zqAxe412a108iroA', 'phone_number_verified', true],
                'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgInBob25lX251bWJlcl92ZXJpZmllZCIsIHRydWVd',
                'XQ_3kPKt1XyX7KANkqVR6yZ2Va5NrPIvPYbyMvRKBMM'
            )
        })

        it('Claim address', async () => {
            testCreateDisclosureObjectAndHash(
                [
                    'AJx-095VPrpTtN4QMOqROA',
                    'address',
                    {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US',
                    },
                ],
                'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0',
                'XzFrzwscM6Gn6CJDc6vVK8BkMnfG8vOSKfpPIZdAfdE'
            )
        })

        it('Claim birthdate', async () => {
            testCreateDisclosureObjectAndHash(
                ['Pc33JM2LchcU_lHggv_ufQ', 'birthdate', '1940-01-01'],
                'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0',
                'gbOsI4Edq2x2Kw-w5wPEzakob9hV1cRD0ATN3oQL9JM'
            )
        })

        it('Claim updated_at', async () => {
            testCreateDisclosureObjectAndHash(
                ['G02NSrQfjFXQ7Io09syajA', 'updated_at', 1570000000],
                'WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgInVwZGF0ZWRfYXQiLCAxNTcwMDAwMDAwXQ',
                'CrQe7S5kqBAHt-nMYXgc6bdt2SH5aTY1sU_M-PgkjPI'
            )
        })

        it('Array Entry 01', async () => {
            testCreateDisclosureArrayAndHash(
                ['lklxF5jMYlGTPUovMNIvCA', 'US'],
                'WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgIlVTIl0',
                'pFndjkZ_VCzmyTa6UjlZo3dh-ko8aIKQc9DlGzhaVYo'
            )
        })

        it('Array Entry 02', async () => {
            testCreateDisclosureArrayAndHash(
                ['nPuoQnkRFq3BIeAm7AnXFA', 'DE'],
                'WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgIkRFIl0',
                '7Cf6JkPudry3lcbwHgeZ8khAv1U1OSlerP0VkBJrWZ0'
            )
        })
    })

    describe('Specification: 5.7.1', () => {
        it('Claim address', async () => {
            testCreateDisclosureObjectAndHash(
                [
                    '2GLC42sKQveCfGfryNRN9w',
                    'address',
                    {
                        street_address: 'Schulstr. 12',
                        locality: 'Schulpforta',
                        region: 'Sachsen-Anhalt',
                        country: 'DE',
                    },
                ],
                'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIlNjaHVsc3RyLiAxMiIsICJsb2NhbGl0eSI6ICJTY2h1bHBmb3J0YSIsICJyZWdpb24iOiAiU2FjaHNlbi1BbmhhbHQiLCAiY291bnRyeSI6ICJERSJ9XQ',
                'fOBUSQvo46yQO-wRwXBcGqvnbKIueISEL961_Sjd4do'
            )
        })
    })

    describe('Specification: 5.7.2', () => {
        it('Claim street_address', async () => {
            testCreateDisclosureObjectAndHash(
                ['2GLC42sKQveCfGfryNRN9w', 'street_address', 'Schulstr. 12'],
                'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgInN0cmVldF9hZGRyZXNzIiwgIlNjaHVsc3RyLiAxMiJd',
                '9gjVuXtdFROCgRrtNcGUXmF65rdezi_6Er_j76kmYyM'
            )
        })

        it('Claim locality', async () => {
            testCreateDisclosureObjectAndHash(
                ['eluV5Og3gSNII8EYnsxA_A', 'locality', 'Schulpforta'],
                'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImxvY2FsaXR5IiwgIlNjaHVscGZvcnRhIl0',
                '6vh9bq-zS4GKM_7GpggVbYzzu6oOGXrmNVGPHP75Ud0'
            )
        })

        it('Claim region', async () => {
            testCreateDisclosureObjectAndHash(
                ['6Ij7tM-a5iVPGboS5tmvVA', 'region', 'Sachsen-Anhalt'],
                'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgInJlZ2lvbiIsICJTYWNoc2VuLUFuaGFsdCJd',
                'KURDPh4ZC19-3tiz-Df39V8eidy1oV3a3H1Da2N0g88'
            )
        })

        it('Claim country', async () => {
            testCreateDisclosureObjectAndHash(
                ['eI8ZWm9QnKPpNPeNenHdhQ', 'country', 'DE'],
                'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgImNvdW50cnkiLCAiREUiXQ',
                'WN9r9dCBJ8HTCsS2jKASxTjEyW5m5x65_Z_2ro2jfXM'
            )
        })
    })

    describe('Specification: 5.7.3', async () => {
        it('Claim street_address', async () => {
            testCreateDisclosureObjectAndHash(
                ['2GLC42sKQveCfGfryNRN9w', 'street_address', 'Schulstr. 12'],
                'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgInN0cmVldF9hZGRyZXNzIiwgIlNjaHVsc3RyLiAxMiJd',
                '9gjVuXtdFROCgRrtNcGUXmF65rdezi_6Er_j76kmYyM'
            )
        })

        it('Claim locality', async () => {
            testCreateDisclosureObjectAndHash(
                ['eluV5Og3gSNII8EYnsxA_A', 'locality', 'Schulpforta'],
                'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImxvY2FsaXR5IiwgIlNjaHVscGZvcnRhIl0',
                '6vh9bq-zS4GKM_7GpggVbYzzu6oOGXrmNVGPHP75Ud0'
            )
        })

        it('Claim region', async () => {
            testCreateDisclosureObjectAndHash(
                ['6Ij7tM-a5iVPGboS5tmvVA', 'region', 'Sachsen-Anhalt'],
                'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgInJlZ2lvbiIsICJTYWNoc2VuLUFuaGFsdCJd',
                'KURDPh4ZC19-3tiz-Df39V8eidy1oV3a3H1Da2N0g88'
            )
        })

        it('Claim country', async () => {
            testCreateDisclosureObjectAndHash(
                ['eI8ZWm9QnKPpNPeNenHdhQ', 'country', 'DE'],
                'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgImNvdW50cnkiLCAiREUiXQ',
                'WN9r9dCBJ8HTCsS2jKASxTjEyW5m5x65_Z_2ro2jfXM'
            )
        })

        it('Claim address', async () => {
            testCreateDisclosureObjectAndHash(
                [
                    'Qg_O64zqAxe412a108iroA',
                    'address',
                    {
                        _sd: [
                            '6vh9bq-zS4GKM_7GpggVbYzzu6oOGXrmNVGPHP75Ud0',
                            '9gjVuXtdFROCgRrtNcGUXmF65rdezi_6Er_j76kmYyM',
                            'KURDPh4ZC19-3tiz-Df39V8eidy1oV3a3H1Da2N0g88',
                            'WN9r9dCBJ8HTCsS2jKASxTjEyW5m5x65_Z_2ro2jfXM',
                        ],
                    },
                ],
                'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgImFkZHJlc3MiLCB7Il9zZCI6IFsiNnZoOWJxLXpTNEdLTV83R3BnZ1ZiWXp6dTZvT0dYcm1OVkdQSFA3NVVkMCIsICI5Z2pWdVh0ZEZST0NnUnJ0TmNHVVhtRjY1cmRlemlfNkVyX2o3NmttWXlNIiwgIktVUkRQaDRaQzE5LTN0aXotRGYzOVY4ZWlkeTFvVjNhM0gxRGEyTjBnODgiLCAiV045cjlkQ0JKOEhUQ3NTMmpLQVN4VGpFeVc1bTV4NjVfWl8ycm8yamZYTSJdfV0',
                'HvrKX6fPV0v9K_yCVFBiLFHsMaxcD_114Em6VT8x1lg'
            )
        })
    })

    describe('Specification: A.1.  Example 2: Handling Structured Claims', async () => {
        it('Claim sub', async () => {
            testCreateDisclosureObjectAndHash(
                [
                    '2GLC42sKQveCfGfryNRN9w',
                    'sub',
                    '6c5c0a49-b589-431d-bae7-219122a9ec2c',
                ],
                'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgInN1YiIsICI2YzVjMGE0OS1iNTg5LTQzMWQtYmFlNy0yMTkxMjJhOWVjMmMiXQ',
                'X6ZAYOII2vPN40V7xExZwVwz7yRmLNcVwt5DL8RLv4g'
            )
        })

        it('Claim email', async () => {
            testCreateDisclosureObjectAndHash(
                [
                    'eI8ZWm9QnKPpNPeNenHdhQ',
                    'email',
                    '"unusual email address"@example.jp',
                ],
                'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgImVtYWlsIiwgIlwidW51c3VhbCBlbWFpbCBhZGRyZXNzXCJAZXhhbXBsZS5qcCJd',
                'Kuet1yAa0HIQvYnOVd59hcViO9Ug6J2kSfqYRBeowvE'
            )
        })

        it('Claim phone_number', async () => {
            testCreateDisclosureObjectAndHash(
                ['Qg_O64zqAxe412a108iroA', 'phone_number', '+81-80-1234-5678'],
                'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgInBob25lX251bWJlciIsICIrODEtODAtMTIzNC01Njc4Il0',
                's0BKYsLWxQQeU8tVlltM7MKsIRTrEIa1PkJmqxBBf5U'
            )
        })

        it('Claim country', async () => {
            testCreateDisclosureObjectAndHash(
                ['lklxF5jMYlGTPUovMNIvCA', 'country', 'JP'],
                'WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgImNvdW50cnkiLCAiSlAiXQ',
                'uNHoWYhXsZhVJCNE2Dqy-zqt7t69gJKy5QaFv7GrMX4'
            )
        })

        it('Claim birthdate', async () => {
            testCreateDisclosureObjectAndHash(
                ['yytVbdAPGcgl2rI4C9GSog', 'birthdate', '1940-01-01'],
                'WyJ5eXRWYmRBUEdjZ2wyckk0QzlHU29nIiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0',
                'MMldOFFzB2d0umlmpTIaGerhWdU_PpYfLvKhh_f_9aY'
            )
        })
    })

    describe('Specification: A.2.  Example 3 - Complex Structured SD-JWT', async () => {
        it('Claim verification_process', async () => {
            testCreateDisclosureObjectAndHash(
                [
                    'eluV5Og3gSNII8EYnsxA_A',
                    'verification_process',
                    'f24c6f-6d3f-4ec5-973e-b0d8506f3bc7',
                ],
                'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgInZlcmlmaWNhdGlvbl9wcm9jZXNzIiwgImYyNGM2Zi02ZDNmLTRlYzUtOTczZS1iMGQ4NTA2ZjNiYzciXQ',
                '7h4UE9qScvDKodXVCuoKfKBJpVBfXMF_TmAGVaZe3Sc'
            )
        })

        it('Claim type', async () => {
            testCreateDisclosureObjectAndHash(
                ['6Ij7tM-a5iVPGboS5tmvVA', 'type', 'document'],
                'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgInR5cGUiLCAiZG9jdW1lbnQiXQ',
                'G5EnhOAOoU9X_6QMNvzFXjpEA_Rc-AEtm1bG_wcaKIk'
            )
        })

        it('Claim method', async () => {
            testCreateDisclosureObjectAndHash(
                ['eI8ZWm9QnKPpNPeNenHdhQ', 'method', 'pipp'],
                'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgIm1ldGhvZCIsICJwaXBwIl0',
                'WpxQ4HSoEtcTmCCKOeDslB_emucYLz2oO8oHNr1bEVQ'
            )
        })

        it('Claim document', async () => {
            testCreateDisclosureObjectAndHash(
                [
                    'AJx-095VPrpTtN4QMOqROA',
                    'document',
                    {
                        type: 'idcard',
                        issuer: { name: 'Stadt Augsburg', country: 'DE' },
                        number: '53554554',
                        date_of_issuance: '2010-03-23',
                        date_of_expiry: '2020-03-22',
                    },
                ],
                'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRvY3VtZW50IiwgeyJ0eXBlIjogImlkY2FyZCIsICJpc3N1ZXIiOiB7Im5hbWUiOiAiU3RhZHQgQXVnc2J1cmciLCAiY291bnRyeSI6ICJERSJ9LCAibnVtYmVyIjogIjUzNTU0NTU0IiwgImRhdGVfb2ZfaXNzdWFuY2UiOiAiMjAxMC0wMy0yMyIsICJkYXRlX29mX2V4cGlyeSI6ICIyMDIwLTAzLTIyIn1d',
                'IhwFrWUB63RcZq9yvgZ0XPc7Gowh3O2kqXeBIswg1B4'
            )
        })

        it('Array entry', async () => {
            testCreateDisclosureArrayAndHash(
                [
                    'Pc33JM2LchcU_lHggv_ufQ',
                    {
                        _sd: [
                            '9wpjVPWuD7PK0nsQDL8B06lmdgV3LVybhHydQpTNyLI',
                            'G5EnhOAOoU9X_6QMNvzFXjpEA_Rc-AEtm1bG_wcaKIk',
                            'IhwFrWUB63RcZq9yvgZ0XPc7Gowh3O2kqXeBIswg1B4',
                            'WpxQ4HSoEtcTmCCKOeDslB_emucYLz2oO8oHNr1bEVQ',
                        ],
                    },
                ],
                'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgeyJfc2QiOiBbIjl3cGpWUFd1RDdQSzBuc1FETDhCMDZsbWRnVjNMVnliaEh5ZFFwVE55TEkiLCAiRzVFbmhPQU9vVTlYXzZRTU52ekZYanBFQV9SYy1BRXRtMWJHX3djYUtJayIsICJJaHdGcldVQjYzUmNacTl5dmdaMFhQYzdHb3doM08ya3FYZUJJc3dnMUI0IiwgIldweFE0SFNvRXRjVG1DQ0tPZURzbEJfZW11Y1lMejJvTzhvSE5yMWJFVlEiXX1d',
                'tYJ0TDucyZZCRMbROG4qRO5vkPSFRxFhUELc18CSl3k'
            )
        })

        it('Claim given_name', async () => {
            testCreateDisclosureObjectAndHash(
                ['G02NSrQfjFXQ7Io09syajA', 'given_name', 'Max'],
                'WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgImdpdmVuX25hbWUiLCAiTWF4Il0',
                'S_498bbpKzB6Eanftss0xc7cOaoneRr3pKr7NdRmsMo'
            )
        })

        it('Claim nationalities', async () => {
            testCreateDisclosureObjectAndHash(
                ['nPuoQnkRFq3BIeAm7AnXFA', 'nationalities', ['DE']],
                'WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgIm5hdGlvbmFsaXRpZXMiLCBbIkRFIl1d',
                'hvDXhwmGcJQsBCA2OtjuLAcwAMpDsaU0nkovcKOqWNE'
            )
        })

        it('Claim birthdate', async () => {
            testCreateDisclosureObjectAndHash(
                ['5bPs1IquZNa0hkaFzzzZNw', 'birthdate', '1956-01-28'],
                'WyI1YlBzMUlxdVpOYTBoa2FGenp6Wk53IiwgImJpcnRoZGF0ZSIsICIxOTU2LTAxLTI4Il0',
                'WNA-UNK7F_zhsAb9syWO6IIQ1uHlTmOU8r8CvJ0cIMk'
            )
        })

        it('Claim birth_middle_name', async () => {
            testCreateDisclosureObjectAndHash(
                ['HbQ4X8srVW3QDxnIJdqyOA', 'birth_middle_name', 'Timotheus'],
                'WyJIYlE0WDhzclZXM1FEeG5JSmRxeU9BIiwgImJpcnRoX21pZGRsZV9uYW1lIiwgIlRpbW90aGV1cyJd',
                'otkxuT14nBiwzNJ3MPaOitOl9pVnXOaEHal_xkyNfKI'
            )
        })

        it('Claim salutation', async () => {
            testCreateDisclosureObjectAndHash(
                ['C9GSoujviJquEgYfojCb1A', 'salutation', 'Dr.'],
                'WyJDOUdTb3VqdmlKcXVFZ1lmb2pDYjFBIiwgInNhbHV0YXRpb24iLCAiRHIuIl0',
                '-aSznId9mWM8ocuQolCllsxVggq1-vHW4OtnhUtVmWw'
            )
        })

        it('Claim msisdn', async () => {
            testCreateDisclosureObjectAndHash(
                ['kx5kF17V-x0JmwUx9vgvtw', 'msisdn', '49123456789'],
                'WyJreDVrRjE3Vi14MEptd1V4OXZndnR3IiwgIm1zaXNkbiIsICI0OTEyMzQ1Njc4OSJd',
                'IKbrYNn3vA7WEFrysvbdBJjDDU_EvQIr0W18vTRpUSg'
            )
        })
    })
})
