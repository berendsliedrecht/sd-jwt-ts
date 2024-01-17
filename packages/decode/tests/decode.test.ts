import { describe, it } from 'node:test'
import { deepStrictEqual } from 'node:assert'
import { hasherAndAlgorithm } from '../../core/tests/utils'
import { decodeSdJwtVc } from '../src/sdJwtVc'

describe('decode sd jwt vc', () => {
    it('decodeFromSdJwtVc', () => {
        const decoded = decodeSdJwtVc(
            'eyJhbGciOiJFZERTQSIsInR5cCI6InZjK3NkLWp3dCIsImtpZCI6IiN6Nk1rdHF0WE5HOENEVVk5UHJydG9TdEZ6ZUNuaHBNbWd4WUwxZ2lrY1czQnp2TlcifQ.eyJ2Y3QiOiJJZGVudGl0eUNyZWRlbnRpYWwiLCJmYW1pbHlfbmFtZSI6IkRvZSIsInBob25lX251bWJlciI6IisxLTIwMi01NTUtMDEwMSIsImFkZHJlc3MiOnsic3RyZWV0X2FkZHJlc3MiOiIxMjMgTWFpbiBTdCIsImxvY2FsaXR5IjoiQW55dG93biIsIl9zZCI6WyJOSm5tY3QwQnFCTUUxSmZCbEM2alJRVlJ1ZXZwRU9OaVl3N0E3TUh1SnlRIiwib201Wnp0WkhCLUdkMDBMRzIxQ1ZfeE00RmFFTlNvaWFPWG5UQUpOY3pCNCJdfSwiY25mIjp7Imp3ayI6eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5IiwieCI6Im9FTlZzeE9VaUg1NFg4d0pMYVZraWNDUmswMHdCSVE0c1JnYms1NE44TW8ifX0sImlzcyI6ImRpZDprZXk6ejZNa3RxdFhORzhDRFVZOVBycnRvU3RGemVDbmhwTW1neFlMMWdpa2NXM0J6dk5XIiwiaWF0IjoxNjk4MTUxNTMyLCJfc2RfYWxnIjoic2hhLTI1NiIsIl9zZCI6WyIxQ3VyMmsyQTJvSUI1Q3NoU0lmX0FfS2ctbDI2dV9xS3VXUTc5UDBWZGFzIiwiUjF6VFV2T1lIZ2NlcGowakh5cEdIejlFSHR0VktmdDB5c3diYzlFVFBiVSIsImVEcVFwZFRYSlhiV2hmLUVzSTd6dzVYNk92WW1GTi1VWlFRTWVzWHdLUHciLCJwZERrMl9YQUtIbzdnT0Fmd0YxYjdPZENVVlRpdDJrSkhheFNFQ1E5eGZjIiwicHNhdUtVTldFaTA5bnUzQ2w4OXhLWGdtcFdFTlpsNXV5MU4xbnluX2pNayIsInNOX2dlMHBIWEY2cW1zWW5YMUE5U2R3SjhjaDhhRU5reGJPRHNUNzRZd0kiXX0.coOK8NzJmEWz4qx-qRhjo-RK7aejrSkQM9La9Cw3eWmzcja9DXrkBoQZKbIJtNoSzSPLjwK2V71W78z0miZsDQ~WyJzYWx0IiwiaXNfb3Zlcl82NSIsdHJ1ZV0~WyJzYWx0IiwiaXNfb3Zlcl8yMSIsdHJ1ZV0~WyJzYWx0IiwiZW1haWwiLCJqb2huZG9lQGV4YW1wbGUuY29tIl0~WyJzYWx0IiwiY291bnRyeSIsIlVTIl0~WyJzYWx0IiwiZ2l2ZW5fbmFtZSIsIkpvaG4iXQ~eyJhbGciOiJFZERTQSIsInR5cCI6ImtiK2p3dCJ9.eyJpYXQiOjE2OTgxNTE1MzIsIm5vbmNlIjoic2FsdCIsImF1ZCI6ImRpZDprZXk6elVDNzRWRXFxaEVIUWNndjR6YWdTUGtxRkp4dU5XdW9CUEtqSnVIRVRFVWVITG9TcVd0OTJ2aVNzbWFXank4MnkiLCJfc2RfaGFzaCI6Ii1kTUd4OGZhUnpOQm91a2EwU0R6V2JkS3JYckw1TFVmUlNQTHN2Q2xPMFkifQ.TQQLqc4ZzoKjQfAghAzC_4aaU3KCS8YqzxAJtzT124guzkv9XSHtPN8d3z181_v-ca2ATXjTRoRciozitE6wBA',
            (data) => hasherAndAlgorithm.hasher(data)
        )

        deepStrictEqual(decoded, {
            compactSdJwtVc:
                'eyJhbGciOiJFZERTQSIsInR5cCI6InZjK3NkLWp3dCIsImtpZCI6IiN6Nk1rdHF0WE5HOENEVVk5UHJydG9TdEZ6ZUNuaHBNbWd4WUwxZ2lrY1czQnp2TlcifQ.eyJ2Y3QiOiJJZGVudGl0eUNyZWRlbnRpYWwiLCJmYW1pbHlfbmFtZSI6IkRvZSIsInBob25lX251bWJlciI6IisxLTIwMi01NTUtMDEwMSIsImFkZHJlc3MiOnsic3RyZWV0X2FkZHJlc3MiOiIxMjMgTWFpbiBTdCIsImxvY2FsaXR5IjoiQW55dG93biIsIl9zZCI6WyJOSm5tY3QwQnFCTUUxSmZCbEM2alJRVlJ1ZXZwRU9OaVl3N0E3TUh1SnlRIiwib201Wnp0WkhCLUdkMDBMRzIxQ1ZfeE00RmFFTlNvaWFPWG5UQUpOY3pCNCJdfSwiY25mIjp7Imp3ayI6eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5IiwieCI6Im9FTlZzeE9VaUg1NFg4d0pMYVZraWNDUmswMHdCSVE0c1JnYms1NE44TW8ifX0sImlzcyI6ImRpZDprZXk6ejZNa3RxdFhORzhDRFVZOVBycnRvU3RGemVDbmhwTW1neFlMMWdpa2NXM0J6dk5XIiwiaWF0IjoxNjk4MTUxNTMyLCJfc2RfYWxnIjoic2hhLTI1NiIsIl9zZCI6WyIxQ3VyMmsyQTJvSUI1Q3NoU0lmX0FfS2ctbDI2dV9xS3VXUTc5UDBWZGFzIiwiUjF6VFV2T1lIZ2NlcGowakh5cEdIejlFSHR0VktmdDB5c3diYzlFVFBiVSIsImVEcVFwZFRYSlhiV2hmLUVzSTd6dzVYNk92WW1GTi1VWlFRTWVzWHdLUHciLCJwZERrMl9YQUtIbzdnT0Fmd0YxYjdPZENVVlRpdDJrSkhheFNFQ1E5eGZjIiwicHNhdUtVTldFaTA5bnUzQ2w4OXhLWGdtcFdFTlpsNXV5MU4xbnluX2pNayIsInNOX2dlMHBIWEY2cW1zWW5YMUE5U2R3SjhjaDhhRU5reGJPRHNUNzRZd0kiXX0.coOK8NzJmEWz4qx-qRhjo-RK7aejrSkQM9La9Cw3eWmzcja9DXrkBoQZKbIJtNoSzSPLjwK2V71W78z0miZsDQ~WyJzYWx0IiwiaXNfb3Zlcl82NSIsdHJ1ZV0~WyJzYWx0IiwiaXNfb3Zlcl8yMSIsdHJ1ZV0~WyJzYWx0IiwiZW1haWwiLCJqb2huZG9lQGV4YW1wbGUuY29tIl0~WyJzYWx0IiwiY291bnRyeSIsIlVTIl0~WyJzYWx0IiwiZ2l2ZW5fbmFtZSIsIkpvaG4iXQ~eyJhbGciOiJFZERTQSIsInR5cCI6ImtiK2p3dCJ9.eyJpYXQiOjE2OTgxNTE1MzIsIm5vbmNlIjoic2FsdCIsImF1ZCI6ImRpZDprZXk6elVDNzRWRXFxaEVIUWNndjR6YWdTUGtxRkp4dU5XdW9CUEtqSnVIRVRFVWVITG9TcVd0OTJ2aVNzbWFXank4MnkiLCJfc2RfaGFzaCI6Ii1kTUd4OGZhUnpOQm91a2EwU0R6V2JkS3JYckw1TFVmUlNQTHN2Q2xPMFkifQ.TQQLqc4ZzoKjQfAghAzC_4aaU3KCS8YqzxAJtzT124guzkv9XSHtPN8d3z181_v-ca2ATXjTRoRciozitE6wBA',
            signedPayload: {
                vct: 'IdentityCredential',
                family_name: 'Doe',
                phone_number: '+1-202-555-0101',
                address: {
                    street_address: '123 Main St',
                    locality: 'Anytown',
                    _sd: [
                        'NJnmct0BqBME1JfBlC6jRQVRuevpEONiYw7A7MHuJyQ',
                        'om5ZztZHB-Gd00LG21CV_xM4FaENSoiaOXnTAJNczB4'
                    ]
                },
                cnf: {
                    jwk: {
                        kty: 'OKP',
                        crv: 'Ed25519',
                        x: 'oENVsxOUiH54X8wJLaVkicCRk00wBIQ4sRgbk54N8Mo'
                    }
                },
                iss: 'did:key:z6MktqtXNG8CDUY9PrrtoStFzeCnhpMmgxYL1gikcW3BzvNW',
                iat: 1698151532,
                _sd_alg: 'sha-256',
                _sd: [
                    '1Cur2k2A2oIB5CshSIf_A_Kg-l26u_qKuWQ79P0Vdas',
                    'R1zTUvOYHgcepj0jHypGHz9EHttVKft0yswbc9ETPbU',
                    'eDqQpdTXJXbWhf-EsI7zw5X6OvYmFN-UZQQMesXwKPw',
                    'pdDk2_XAKHo7gOAfwF1b7OdCUVTit2kJHaxSECQ9xfc',
                    'psauKUNWEi09nu3Cl89xKXgmpWENZl5uy1N1nyn_jMk',
                    'sN_ge0pHXF6qmsYnX1A9SdwJ8ch8aENkxbODsT74YwI'
                ]
            },
            header: {
                alg: 'EdDSA',
                typ: 'vc+sd-jwt',
                kid: '#z6MktqtXNG8CDUY9PrrtoStFzeCnhpMmgxYL1gikcW3BzvNW'
            },
            signature: Uint8Array.from([
                114, 131, 138, 240, 220, 201, 152, 69, 179, 226, 172, 126, 169,
                24, 99, 163, 228, 74, 237, 167, 163, 173, 41, 16, 51, 210, 218,
                244, 44, 55, 121, 105, 179, 114, 54, 189, 13, 122, 228, 6, 132,
                25, 41, 178, 9, 180, 218, 18, 205, 35, 203, 143, 2, 182, 87,
                189, 86, 239, 204, 244, 154, 38, 108, 13
            ]),
            keyBinding: {
                header: {
                    alg: 'EdDSA',
                    typ: 'kb+jwt'
                },
                payload: {
                    iat: 1698151532,
                    nonce: 'salt',
                    aud: 'did:key:zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y',
                    _sd_hash: '-dMGx8faRzNBouka0SDzWbdKrXrL5LUfRSPLsvClO0Y'
                },
                signature: Uint8Array.from([
                    77, 4, 11, 169, 206, 25, 206, 130, 163, 65, 240, 32, 132,
                    12, 194, 255, 134, 154, 83, 114, 130, 75, 198, 42, 207, 16,
                    9, 183, 52, 245, 219, 136, 46, 206, 75, 253, 93, 33, 237,
                    60, 223, 29, 223, 61, 124, 215, 251, 254, 113, 173, 128, 77,
                    120, 211, 70, 132, 92, 138, 140, 226, 180, 78, 176, 4
                ])
            },
            disclosures: [
                {
                    salt: 'salt',
                    key: 'is_over_65',
                    value: true,
                    encoded: 'WyJzYWx0IiwiaXNfb3Zlcl82NSIsdHJ1ZV0',
                    digest: 'sN_ge0pHXF6qmsYnX1A9SdwJ8ch8aENkxbODsT74YwI'
                },
                {
                    salt: 'salt',
                    key: 'is_over_21',
                    value: true,
                    encoded: 'WyJzYWx0IiwiaXNfb3Zlcl8yMSIsdHJ1ZV0',
                    digest: 'R1zTUvOYHgcepj0jHypGHz9EHttVKft0yswbc9ETPbU'
                },
                {
                    salt: 'salt',
                    key: 'email',
                    value: 'johndoe@example.com',
                    encoded:
                        'WyJzYWx0IiwiZW1haWwiLCJqb2huZG9lQGV4YW1wbGUuY29tIl0',
                    digest: 'psauKUNWEi09nu3Cl89xKXgmpWENZl5uy1N1nyn_jMk'
                },
                {
                    salt: 'salt',
                    key: 'country',
                    value: 'US',
                    encoded: 'WyJzYWx0IiwiY291bnRyeSIsIlVTIl0',
                    digest: 'om5ZztZHB-Gd00LG21CV_xM4FaENSoiaOXnTAJNczB4'
                },
                {
                    salt: 'salt',
                    key: 'given_name',
                    value: 'John',
                    encoded: 'WyJzYWx0IiwiZ2l2ZW5fbmFtZSIsIkpvaG4iXQ',
                    digest: 'eDqQpdTXJXbWhf-EsI7zw5X6OvYmFN-UZQQMesXwKPw'
                }
            ],
            decodedPayload: {
                vct: 'IdentityCredential',
                family_name: 'Doe',
                phone_number: '+1-202-555-0101',
                address: {
                    street_address: '123 Main St',
                    locality: 'Anytown',
                    country: 'US'
                },
                cnf: {
                    jwk: {
                        kty: 'OKP',
                        crv: 'Ed25519',
                        x: 'oENVsxOUiH54X8wJLaVkicCRk00wBIQ4sRgbk54N8Mo'
                    }
                },
                iss: 'did:key:z6MktqtXNG8CDUY9PrrtoStFzeCnhpMmgxYL1gikcW3BzvNW',
                iat: 1698151532,
                is_over_65: true,
                is_over_21: true,
                email: 'johndoe@example.com',
                given_name: 'John'
            }
        })
    })
})
