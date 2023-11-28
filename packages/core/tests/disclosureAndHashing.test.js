'use strict'
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected)
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            )
        })
    }
Object.defineProperty(exports, '__esModule', { value: true })
const node_test_1 = require('node:test')
const utils_1 = require('./utils')
;(0, node_test_1.describe)('disclosures and hashing', () => {
    ;(0, node_test_1.before)(utils_1.prelude)
    ;(0, node_test_1.describe)('Specification: 5.5', () => {
        ;(0, node_test_1.it)('Claim given_name', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    ['2GLC42sKQveCfGfryNRN9w', 'given_name', 'John'],
                    'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImdpdmVuX25hbWUiLCAiSm9obiJd',
                    'jsu9yVulwQQlhFlM_3JlzMaSFzglhQG0DpfayQwLUK4'
                )
            })
        )
        ;(0, node_test_1.it)('Claim family_name', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    ['eluV5Og3gSNII8EYnsxA_A', 'family_name', 'Doe'],
                    'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImZhbWlseV9uYW1lIiwgIkRvZSJd',
                    'TGf4oLbgwd5JQaHyKVQZU9UdGE0w5rtDsrZzfUaomLo'
                )
            })
        )
        ;(0, node_test_1.it)('Claim email', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    ['6Ij7tM-a5iVPGboS5tmvVA', 'email', 'johndoe@example.com'],
                    'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ',
                    'JzYjH4svliH0R3PyEMfeZu6Jt69u5qehZo7F7EPYlSE'
                )
            })
        )
        ;(0, node_test_1.it)('Claim phone_number', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    [
                        'eI8ZWm9QnKPpNPeNenHdhQ',
                        'phone_number',
                        '+1-202-555-0101'
                    ],
                    'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ',
                    'PorFbpKuVu6xymJagvkFsFXAbRoc2JGlAUA2BA4o7cI'
                )
            })
        )
        ;(0, node_test_1.it)('Claim phone_number_verified', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    ['Qg_O64zqAxe412a108iroA', 'phone_number_verified', true],
                    'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgInBob25lX251bWJlcl92ZXJpZmllZCIsIHRydWVd',
                    'XQ_3kPKt1XyX7KANkqVR6yZ2Va5NrPIvPYbyMvRKBMM'
                )
            })
        )
        ;(0, node_test_1.it)('Claim address', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    [
                        'AJx-095VPrpTtN4QMOqROA',
                        'address',
                        {
                            street_address: '123 Main St',
                            locality: 'Anytown',
                            region: 'Anystate',
                            country: 'US'
                        }
                    ],
                    'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0',
                    'XzFrzwscM6Gn6CJDc6vVK8BkMnfG8vOSKfpPIZdAfdE'
                )
            })
        )
        ;(0, node_test_1.it)('Claim birthdate', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    ['Pc33JM2LchcU_lHggv_ufQ', 'birthdate', '1940-01-01'],
                    'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0',
                    'gbOsI4Edq2x2Kw-w5wPEzakob9hV1cRD0ATN3oQL9JM'
                )
            })
        )
        ;(0, node_test_1.it)('Claim updated_at', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    ['G02NSrQfjFXQ7Io09syajA', 'updated_at', 1570000000],
                    'WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgInVwZGF0ZWRfYXQiLCAxNTcwMDAwMDAwXQ',
                    'CrQe7S5kqBAHt-nMYXgc6bdt2SH5aTY1sU_M-PgkjPI'
                )
            })
        )
        ;(0, node_test_1.it)('Array Entry 01', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureArrayAndHash)(
                    ['lklxF5jMYlGTPUovMNIvCA', 'US'],
                    'WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgIlVTIl0',
                    'pFndjkZ_VCzmyTa6UjlZo3dh-ko8aIKQc9DlGzhaVYo'
                )
            })
        )
        ;(0, node_test_1.it)('Array Entry 02', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureArrayAndHash)(
                    ['nPuoQnkRFq3BIeAm7AnXFA', 'DE'],
                    'WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgIkRFIl0',
                    '7Cf6JkPudry3lcbwHgeZ8khAv1U1OSlerP0VkBJrWZ0'
                )
            })
        )
    })
    ;(0, node_test_1.describe)('Specification: 5.7.1', () => {
        ;(0, node_test_1.it)('Claim address', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    [
                        '2GLC42sKQveCfGfryNRN9w',
                        'address',
                        {
                            street_address: 'Schulstr. 12',
                            locality: 'Schulpforta',
                            region: 'Sachsen-Anhalt',
                            country: 'DE'
                        }
                    ],
                    'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIlNjaHVsc3RyLiAxMiIsICJsb2NhbGl0eSI6ICJTY2h1bHBmb3J0YSIsICJyZWdpb24iOiAiU2FjaHNlbi1BbmhhbHQiLCAiY291bnRyeSI6ICJERSJ9XQ',
                    'fOBUSQvo46yQO-wRwXBcGqvnbKIueISEL961_Sjd4do'
                )
            })
        )
    })
    ;(0, node_test_1.describe)('Specification: 5.7.2', () => {
        ;(0, node_test_1.it)('Claim street_address', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    [
                        '2GLC42sKQveCfGfryNRN9w',
                        'street_address',
                        'Schulstr. 12'
                    ],
                    'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgInN0cmVldF9hZGRyZXNzIiwgIlNjaHVsc3RyLiAxMiJd',
                    '9gjVuXtdFROCgRrtNcGUXmF65rdezi_6Er_j76kmYyM'
                )
            })
        )
        ;(0, node_test_1.it)('Claim locality', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    ['eluV5Og3gSNII8EYnsxA_A', 'locality', 'Schulpforta'],
                    'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImxvY2FsaXR5IiwgIlNjaHVscGZvcnRhIl0',
                    '6vh9bq-zS4GKM_7GpggVbYzzu6oOGXrmNVGPHP75Ud0'
                )
            })
        )
        ;(0, node_test_1.it)('Claim region', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    ['6Ij7tM-a5iVPGboS5tmvVA', 'region', 'Sachsen-Anhalt'],
                    'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgInJlZ2lvbiIsICJTYWNoc2VuLUFuaGFsdCJd',
                    'KURDPh4ZC19-3tiz-Df39V8eidy1oV3a3H1Da2N0g88'
                )
            })
        )
        ;(0, node_test_1.it)('Claim country', () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                    ['eI8ZWm9QnKPpNPeNenHdhQ', 'country', 'DE'],
                    'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgImNvdW50cnkiLCAiREUiXQ',
                    'WN9r9dCBJ8HTCsS2jKASxTjEyW5m5x65_Z_2ro2jfXM'
                )
            })
        )
    })
    ;(0, node_test_1.describe)('Specification: 5.7.3', () =>
        __awaiter(void 0, void 0, void 0, function* () {
            ;(0, node_test_1.it)('Claim street_address', () =>
                __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                        [
                            '2GLC42sKQveCfGfryNRN9w',
                            'street_address',
                            'Schulstr. 12'
                        ],
                        'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgInN0cmVldF9hZGRyZXNzIiwgIlNjaHVsc3RyLiAxMiJd',
                        '9gjVuXtdFROCgRrtNcGUXmF65rdezi_6Er_j76kmYyM'
                    )
                })
            )
            ;(0, node_test_1.it)('Claim locality', () =>
                __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                        ['eluV5Og3gSNII8EYnsxA_A', 'locality', 'Schulpforta'],
                        'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImxvY2FsaXR5IiwgIlNjaHVscGZvcnRhIl0',
                        '6vh9bq-zS4GKM_7GpggVbYzzu6oOGXrmNVGPHP75Ud0'
                    )
                })
            )
            ;(0, node_test_1.it)('Claim region', () =>
                __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                        ['6Ij7tM-a5iVPGboS5tmvVA', 'region', 'Sachsen-Anhalt'],
                        'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgInJlZ2lvbiIsICJTYWNoc2VuLUFuaGFsdCJd',
                        'KURDPh4ZC19-3tiz-Df39V8eidy1oV3a3H1Da2N0g88'
                    )
                })
            )
            ;(0, node_test_1.it)('Claim country', () =>
                __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                        ['eI8ZWm9QnKPpNPeNenHdhQ', 'country', 'DE'],
                        'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgImNvdW50cnkiLCAiREUiXQ',
                        'WN9r9dCBJ8HTCsS2jKASxTjEyW5m5x65_Z_2ro2jfXM'
                    )
                })
            )
            ;(0, node_test_1.it)('Claim address', () =>
                __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                        [
                            'Qg_O64zqAxe412a108iroA',
                            'address',
                            {
                                _sd: [
                                    '6vh9bq-zS4GKM_7GpggVbYzzu6oOGXrmNVGPHP75Ud0',
                                    '9gjVuXtdFROCgRrtNcGUXmF65rdezi_6Er_j76kmYyM',
                                    'KURDPh4ZC19-3tiz-Df39V8eidy1oV3a3H1Da2N0g88',
                                    'WN9r9dCBJ8HTCsS2jKASxTjEyW5m5x65_Z_2ro2jfXM'
                                ]
                            }
                        ],
                        'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgImFkZHJlc3MiLCB7Il9zZCI6IFsiNnZoOWJxLXpTNEdLTV83R3BnZ1ZiWXp6dTZvT0dYcm1OVkdQSFA3NVVkMCIsICI5Z2pWdVh0ZEZST0NnUnJ0TmNHVVhtRjY1cmRlemlfNkVyX2o3NmttWXlNIiwgIktVUkRQaDRaQzE5LTN0aXotRGYzOVY4ZWlkeTFvVjNhM0gxRGEyTjBnODgiLCAiV045cjlkQ0JKOEhUQ3NTMmpLQVN4VGpFeVc1bTV4NjVfWl8ycm8yamZYTSJdfV0',
                        'HvrKX6fPV0v9K_yCVFBiLFHsMaxcD_114Em6VT8x1lg'
                    )
                })
            )
        })
    )
    ;(0, node_test_1.describe)(
        'Specification: A.1.  Example 2: Handling Structured Claims',
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('Claim sub', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                '2GLC42sKQveCfGfryNRN9w',
                                'sub',
                                '6c5c0a49-b589-431d-bae7-219122a9ec2c'
                            ],
                            'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgInN1YiIsICI2YzVjMGE0OS1iNTg5LTQzMWQtYmFlNy0yMTkxMjJhOWVjMmMiXQ',
                            'X6ZAYOII2vPN40V7xExZwVwz7yRmLNcVwt5DL8RLv4g'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim email', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'eI8ZWm9QnKPpNPeNenHdhQ',
                                'email',
                                '"unusual email address"@example.jp'
                            ],
                            'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgImVtYWlsIiwgIlwidW51c3VhbCBlbWFpbCBhZGRyZXNzXCJAZXhhbXBsZS5qcCJd',
                            'Kuet1yAa0HIQvYnOVd59hcViO9Ug6J2kSfqYRBeowvE'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim phone_number', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'Qg_O64zqAxe412a108iroA',
                                'phone_number',
                                '+81-80-1234-5678'
                            ],
                            'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgInBob25lX251bWJlciIsICIrODEtODAtMTIzNC01Njc4Il0',
                            's0BKYsLWxQQeU8tVlltM7MKsIRTrEIa1PkJmqxBBf5U'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim country', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['lklxF5jMYlGTPUovMNIvCA', 'country', 'JP'],
                            'WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgImNvdW50cnkiLCAiSlAiXQ',
                            'uNHoWYhXsZhVJCNE2Dqy-zqt7t69gJKy5QaFv7GrMX4'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim birthdate', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'yytVbdAPGcgl2rI4C9GSog',
                                'birthdate',
                                '1940-01-01'
                            ],
                            'WyJ5eXRWYmRBUEdjZ2wyckk0QzlHU29nIiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0',
                            'MMldOFFzB2d0umlmpTIaGerhWdU_PpYfLvKhh_f_9aY'
                        )
                    })
                )
            })
    )
    ;(0, node_test_1.describe)(
        'Specification: A.2.  Example 3 - Complex Structured SD-JWT',
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('Claim verification_process', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'eluV5Og3gSNII8EYnsxA_A',
                                'verification_process',
                                'f24c6f-6d3f-4ec5-973e-b0d8506f3bc7'
                            ],
                            'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgInZlcmlmaWNhdGlvbl9wcm9jZXNzIiwgImYyNGM2Zi02ZDNmLTRlYzUtOTczZS1iMGQ4NTA2ZjNiYzciXQ',
                            '7h4UE9qScvDKodXVCuoKfKBJpVBfXMF_TmAGVaZe3Sc'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim type', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['6Ij7tM-a5iVPGboS5tmvVA', 'type', 'document'],
                            'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgInR5cGUiLCAiZG9jdW1lbnQiXQ',
                            'G5EnhOAOoU9X_6QMNvzFXjpEA_Rc-AEtm1bG_wcaKIk'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim method', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['eI8ZWm9QnKPpNPeNenHdhQ', 'method', 'pipp'],
                            'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgIm1ldGhvZCIsICJwaXBwIl0',
                            'WpxQ4HSoEtcTmCCKOeDslB_emucYLz2oO8oHNr1bEVQ'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim document', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'AJx-095VPrpTtN4QMOqROA',
                                'document',
                                {
                                    type: 'idcard',
                                    issuer: {
                                        name: 'Stadt Augsburg',
                                        country: 'DE'
                                    },
                                    number: '53554554',
                                    date_of_issuance: '2010-03-23',
                                    date_of_expiry: '2020-03-22'
                                }
                            ],
                            'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImRvY3VtZW50IiwgeyJ0eXBlIjogImlkY2FyZCIsICJpc3N1ZXIiOiB7Im5hbWUiOiAiU3RhZHQgQXVnc2J1cmciLCAiY291bnRyeSI6ICJERSJ9LCJudW1iZXIiOiAiNTM1NTQ1NTQiLCAiZGF0ZV9vZl9pc3N1YW5jZSI6ICIyMDEwLTAzLTIzIiwgImRhdGVfb2ZfZXhwaXJ5IjogIjIwMjAtMDMtMjIifV0',
                            '1WDNBjpMzqU1RWWrnbQ0Dk5SXNRWboFHJHSHNHOwh38'
                        )
                    })
                )
                ;(0, node_test_1.it)('Array entry', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureArrayAndHash)(
                            [
                                'Pc33JM2LchcU_lHggv_ufQ',
                                {
                                    _sd: [
                                        '9wpjVPWuD7PK0nsQDL8B06lmdgV3LVybhHydQpTNyLI',
                                        'G5EnhOAOoU9X_6QMNvzFXjpEA_Rc-AEtm1bG_wcaKIk',
                                        'IhwFrWUB63RcZq9yvgZ0XPc7Gowh3O2kqXeBIswg1B4',
                                        'WpxQ4HSoEtcTmCCKOeDslB_emucYLz2oO8oHNr1bEVQ'
                                    ]
                                }
                            ],
                            'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgeyJfc2QiOiBbIjl3cGpWUFd1RDdQSzBuc1FETDhCMDZsbWRnVjNMVnliaEh5ZFFwVE55TEkiLCAiRzVFbmhPQU9vVTlYXzZRTU52ekZYanBFQV9SYy1BRXRtMWJHX3djYUtJayIsICJJaHdGcldVQjYzUmNacTl5dmdaMFhQYzdHb3doM08ya3FYZUJJc3dnMUI0IiwgIldweFE0SFNvRXRjVG1DQ0tPZURzbEJfZW11Y1lMejJvTzhvSE5yMWJFVlEiXX1d',
                            'tYJ0TDucyZZCRMbROG4qRO5vkPSFRxFhUELc18CSl3k'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim given_name', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['G02NSrQfjFXQ7Io09syajA', 'given_name', 'Max'],
                            'WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgImdpdmVuX25hbWUiLCAiTWF4Il0',
                            'S_498bbpKzB6Eanftss0xc7cOaoneRr3pKr7NdRmsMo'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim nationalities', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['nPuoQnkRFq3BIeAm7AnXFA', 'nationalities', ['DE']],
                            'WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgIm5hdGlvbmFsaXRpZXMiLCBbIkRFIl1d',
                            'hvDXhwmGcJQsBCA2OtjuLAcwAMpDsaU0nkovcKOqWNE'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim birthdate', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                '5bPs1IquZNa0hkaFzzzZNw',
                                'birthdate',
                                '1956-01-28'
                            ],
                            'WyI1YlBzMUlxdVpOYTBoa2FGenp6Wk53IiwgImJpcnRoZGF0ZSIsICIxOTU2LTAxLTI4Il0',
                            'WNA-UNK7F_zhsAb9syWO6IIQ1uHlTmOU8r8CvJ0cIMk'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim birth_middle_name', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'HbQ4X8srVW3QDxnIJdqyOA',
                                'birth_middle_name',
                                'Timotheus'
                            ],
                            'WyJIYlE0WDhzclZXM1FEeG5JSmRxeU9BIiwgImJpcnRoX21pZGRsZV9uYW1lIiwgIlRpbW90aGV1cyJd',
                            'otkxuT14nBiwzNJ3MPaOitOl9pVnXOaEHal_xkyNfKI'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim salutation', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['C9GSoujviJquEgYfojCb1A', 'salutation', 'Dr.'],
                            'WyJDOUdTb3VqdmlKcXVFZ1lmb2pDYjFBIiwgInNhbHV0YXRpb24iLCAiRHIuIl0',
                            '-aSznId9mWM8ocuQolCllsxVggq1-vHW4OtnhUtVmWw'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim msisdn', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['kx5kF17V-x0JmwUx9vgvtw', 'msisdn', '49123456789'],
                            'WyJreDVrRjE3Vi14MEptd1V4OXZndnR3IiwgIm1zaXNkbiIsICI0OTEyMzQ1Njc4OSJd',
                            'IKbrYNn3vA7WEFrysvbdBJjDDU_EvQIr0W18vTRpUSg'
                        )
                    })
                )
            })
    )
    ;(0, node_test_1.describe)(
        'Specification: A.3.  Example 4a - SD-JWT-based Verifiable Credentials (SD-JWT VC)',
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('Claim first_name', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['2GLC42sKQveCfGfryNRN9w', 'first_name', 'Erika'],
                            'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImZpcnN0X25hbWUiLCAiRXJpa2EiXQ',
                            'Ch-DBcL3kb4VbHIwtknnZdNUHthEq9MZjoFdg6idiho'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim family_name', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'eluV5Og3gSNII8EYnsxA_A',
                                'family_name',
                                'Mustermann'
                            ],
                            'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImZhbWlseV9uYW1lIiwgIk11c3Rlcm1hbm4iXQ',
                            'I00fcFUoDXCucp5yy2ujqPssDVGaWNiUliNz_awD0gc'
                        )
                    })
                )
                ;(0, node_test_1.it)('Array Entry', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureArrayAndHash)(
                            ['6Ij7tM-a5iVPGboS5tmvVA', 'DE'],
                            'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgIkRFIl0',
                            'JuL32QXDzizl-L6CLrfxfjpZsX3O6vsfpCVd1jkwJYg'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim nationalities', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'eI8ZWm9QnKPpNPeNenHdhQ',
                                'nationalities',
                                [
                                    {
                                        '...': 'JuL32QXDzizl-L6CLrfxfjpZsX3O6vsfpCVd1jkwJYg'
                                    }
                                ]
                            ],
                            'WyJlSThaV205UW5LUHBOUGVOZW5IZGhRIiwgIm5hdGlvbmFsaXRpZXMiLCBbeyIuLi4iOiAiSnVMMzJRWER6aXpsLUw2Q0xyZnhmanBac1gzTzZ2c2ZwQ1ZkMWprd0pZZyJ9XV0',
                            'zU452lkGbEKh8ZuH_8Kx3CUvn1F4y1gZLqlDTgX_8Pk'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim birth_family_name', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'Qg_O64zqAxe412a108iroA',
                                'birth_family_name',
                                'Schmidt'
                            ],
                            'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgImJpcnRoX2ZhbWlseV9uYW1lIiwgIlNjaG1pZHQiXQ',
                            'X9MaPaFWmQYpfHEdytRdaclnYoEru8EztBEUQuWOe44'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim birthdate', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'AJx-095VPrpTtN4QMOqROA',
                                'birthdate',
                                '1973-01-01'
                            ],
                            'WyJBSngtMDk1VlBycFR0TjRRTU9xUk9BIiwgImJpcnRoZGF0ZSIsICIxOTczLTAxLTAxIl0',
                            '0n9yzFSWvK_BUHiaMhm12ghrCtVahrGJ6_-kZP-ySq4'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim address', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                '-6hCeREWrcEh4CbsCdcU5Q',
                                'address',
                                {
                                    _sd: [
                                        '8z8z9X9jUtb99gjejCwFAGz4aqlHf-sCqQ6eM_qmpUQ',
                                        'Cxq4872UXXngGULT_kl8fdwVFkyK6AJfPZLy7L5_0kI',
                                        'lc2O0xDxYwbgc8r2DEw7yh_IDWexW8CbgtzYPQFRi4c'
                                    ],
                                    postal_code: '12345',
                                    locality: 'Irgendwo',
                                    street_address: 'Sonnenstrasse 23',
                                    country_code: 'DE'
                                }
                            ],
                            'WyItNmhDZVJFV3JjRWg0Q2JzQ2RjVTVRIiwgImFkZHJlc3MiLCB7Il9zZCI6IFsiOHo4ejlYOWpVdGI5OWdqZWpDd0ZBR3o0YXFsSGYtc0NxUTZlTV9xbXBVUSIsICJDeHE0ODcyVVhYbmdHVUxUX2tsOGZkd1ZGa3lLNkFKZlBaTHk3TDVfMGtJIiwgImxjMk8weER4WXdiZ2M4cjJERXc3eWhfSURXZXhXOENiZ3R6WVBRRlJpNGMiXSwicG9zdGFsX2NvZGUiOiAiMTIzNDUiLCAibG9jYWxpdHkiOiAiSXJnZW5kd28iLCAic3RyZWV0X2FkZHJlc3MiOiAiU29ubmVuc3RyYXNzZSAyMyIsICJjb3VudHJ5X2NvZGUiOiAiREUifV0',
                            'nG9HpcnMppd0BODRJV6jv4KzrxsDOW_0uzC2wRhf28w'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim is_over_18', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['s-zUiq5k1rSGRoXPPNk35Q', 'is_over_18', true],
                            'WyJzLXpVaXE1azFyU0dSb1hQUE5rMzVRIiwgImlzX292ZXJfMTgiLCB0cnVlXQ',
                            'rNhKoraaq--x7BWWIVhbGXu1XXXLM8ivZXD3m2FZMgs'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim is_over_21', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['rZbT82uURnN-qaT_s-r7yw', 'is_over_21', true],
                            'WyJyWmJUODJ1VVJuTi1xYVRfcy1yN3l3IiwgImlzX292ZXJfMjEiLCB0cnVlXQ',
                            '09TbSuo12i2CqZbg31AFgbGy_UnMIXIHoMjsELpukqg'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim is_over_65', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['WxVTnB18lqFV2DA-BLtFHQ', 'is_over_65', false],
                            'WyJXeFZUbkIxOGxxRlYyREEtQkx0RkhRIiwgImlzX292ZXJfNjUiLCBmYWxzZV0',
                            '910byr3UVRqRzQoPzBsc20m-eMgpZAhLN6z8NoGF5mc'
                        )
                    })
                )
            })
    )
    ;(0, node_test_1.describe)(
        'Specification: A.4.  Example 4b - W3C Verifiable Credentials Data Model v2.0',
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                ;(0, node_test_1.it)('Claim atcCode', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['2GLC42sKQveCfGfryNRN9w', 'atcCode', 'J07BX03'],
                            'WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImF0Y0NvZGUiLCAiSjA3QlgwMyJd',
                            '1cF5hLwkhMNIaqfWJrXI7NMWedL-9f6Y2PA52yPjSZI'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim medicinalProductName', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'eluV5Og3gSNII8EYnsxA_A',
                                'medicinalProductName',
                                'COVID-19 Vaccine Moderna'
                            ],
                            'WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgIm1lZGljaW5hbFByb2R1Y3ROYW1lIiwgIkNPVklELTE5IFZhY2NpbmUgTW9kZXJuYSJd',
                            'Hiy6WWueLD5bn16298tPv7GXhmldMDOTnBi-CZbphNo'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim medicinalProductName', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                '6Ij7tM-a5iVPGboS5tmvVA',
                                'marketingAuthorizationHolder',
                                'Moderna Biotech'
                            ],
                            'WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgIm1hcmtldGluZ0F1dGhvcml6YXRpb25Ib2xkZXIiLCAiTW9kZXJuYSBCaW90ZWNoIl0',
                            'Lb027q691jXXl-jC73vi8ebOj9smx3C-_og7gA4TBQE'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim countryOfVaccination', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'Qg_O64zqAxe412a108iroA',
                                'countryOfVaccination',
                                'GE'
                            ],
                            'WyJRZ19PNjR6cUF4ZTQxMmExMDhpcm9BIiwgImNvdW50cnlPZlZhY2NpbmF0aW9uIiwgIkdFIl0',
                            'JzjLgtP29dP-B3td12P674gFmK2zy81HMtBgf6CJNWg'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim order', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['Pc33JM2LchcU_lHggv_ufQ', 'order', '3/3'],
                            'WyJQYzMzSk0yTGNoY1VfbEhnZ3ZfdWZRIiwgIm9yZGVyIiwgIjMvMyJd',
                            'b0eUsvGP-ODDdFoY4NlzlXc3tDslWJtCJF75Nw8Oj_g'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim gender', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['G02NSrQfjFXQ7Io09syajA', 'gender', 'Female'],
                            'WyJHMDJOU3JRZmpGWFE3SW8wOXN5YWpBIiwgImdlbmRlciIsICJGZW1hbGUiXQ',
                            '3nzLq81M2oN06wdv1shHvOEJVxZ5KLmdDkHEDJABWEI'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim birthDate', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'lklxF5jMYlGTPUovMNIvCA',
                                'birthDate',
                                '1961-08-17'
                            ],
                            'WyJsa2x4RjVqTVlsR1RQVW92TU5JdkNBIiwgImJpcnRoRGF0ZSIsICIxOTYxLTA4LTE3Il0',
                            'Pn1sWi06G4LJrnn-_RT0RbM_HTdxnPJQuX2fzWv_JOU'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim givenName', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            ['nPuoQnkRFq3BIeAm7AnXFA', 'givenName', 'Marion'],
                            'WyJuUHVvUW5rUkZxM0JJZUFtN0FuWEZBIiwgImdpdmVuTmFtZSIsICJNYXJpb24iXQ',
                            'lF9uzdsw7HplGLc714Tr4WO7MGJza7tt7QFleCX4Itw'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim familyName', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                '5bPs1IquZNa0hkaFzzzZNw',
                                'familyName',
                                'Mustermann'
                            ],
                            'WyI1YlBzMUlxdVpOYTBoa2FGenp6Wk53IiwgImZhbWlseU5hbWUiLCAiTXVzdGVybWFubiJd',
                            '1lSQBNY24q0Th6OGzthq-7-4l6cAaxrYXOGZpeW_lnA'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim administeringCentre', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                '5a2W0_NrlEZzfqmk_7Pq-w',
                                'administeringCentre',
                                'Praxis Sommergarten'
                            ],
                            'WyI1YTJXMF9OcmxFWnpmcW1rXzdQcS13IiwgImFkbWluaXN0ZXJpbmdDZW50cmUiLCAiUHJheGlzIFNvbW1lcmdhcnRlbiJd',
                            'TCmzrl7K2gev_du7pcMIyzRLHp-Yeg-Fl_cxtrUvPxg'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim batchNumber', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'y1sVU5wdfJahVdgwPgS7RQ',
                                'batchNumber',
                                '1626382736'
                            ],
                            'WyJ5MXNWVTV3ZGZKYWhWZGd3UGdTN1JRIiwgImJhdGNoTnVtYmVyIiwgIjE2MjYzODI3MzYiXQ',
                            'V7kJBLK78TmVDOmrfJ7ZuUPHuK_2cc7yZRa4qV1txwM'
                        )
                    })
                )
                ;(0, node_test_1.it)('Claim healthProfessional', () =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        yield (0, utils_1.testCreateDisclosureObjectAndHash)(
                            [
                                'HbQ4X8srVW3QDxnIJdqyOA',
                                'healthProfessional',
                                '883110000015376'
                            ],
                            'WyJIYlE0WDhzclZXM1FEeG5JSmRxeU9BIiwgImhlYWx0aFByb2Zlc3Npb25hbCIsICI4ODMxMTAwMDAwMTUzNzYiXQ',
                            '1V_K-8lDQ8iFXBFXbZY9ehqR4HabWCi5T0ybIzZPeww'
                        )
                    })
                )
            })
    )
})
//# sourceMappingURL=disclosureAndHashing.test.js.map
