import { before, describe, it } from 'node:test'
import { createPublicKey, verify } from 'node:crypto'
import assert, { deepStrictEqual, rejects, strictEqual } from 'node:assert'
import {
    hasherAndAlgorithm,
    keyBindingSigner,
    prelude,
    publicHolderKeyJwk,
    saltGenerator,
    signer,
    verifier
} from './utils'

import {
    HasherAlgorithm,
    KeyBinding,
    SdJwtVc,
    SignatureAndEncryptionAlgorithm,
    SdJwtVcError
} from '../src'

describe('sd-jwt-vc', async () => {
    before(prelude)

    describe('create sd-jwt-vc', async () => {
        it('create a simple sd-jwt-vc', async () => {
            const cnf = publicHolderKeyJwk

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    type: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    cnf,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(() => new Uint8Array(32).fill(42))
                .withHasher({
                    hasher: (input: string) => `hash=${input}`,
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            const compact = await sdJwtVc.toCompact()

            strictEqual(
                compact,
                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ0eXBlIjogIklkZW50aXR5Q3JlZGVudGlhbCIsICJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9pc3N1ZXIiLCAiaWF0IjogMTY5ODA1NjExMCwiY25mIjogeyJqd2siOiB7ImNydiI6ICJFZDI1NTE5IiwgImt0eSI6ICJPS1AiLCAieCI6ICJDaXJabi1WOW5fS1JoOGMySXlXcU90clZtOXdsemFWRERTOFk0ekdtUXNvIn19LCJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJoYXNoPVd5SnpZV3gwSWl3Z0ltRmtaSEpsYzNNaUxDQjdJbk4wY21WbGRGOWhaR1J5WlhOeklqb2dJakV5TXlCTllXbHVJRk4wSWl3Z0lteHZZMkZzYVhSNUlqb2dJa0Z1ZVhSdmQyNGlMQ0FpY21WbmFXOXVJam9nSWtGdWVYTjBZWFJsSWl3Z0ltTnZkVzUwY25raU9pQWlWVk1pZlYwIiwgImhhc2g9V3lKellXeDBJaXdnSW1KcGNuUm9aR0YwWlNJc0lDSXhPVFF3TFRBeExUQXhJbDAiLCAiaGFzaD1XeUp6WVd4MElpd2dJbVZ0WVdsc0lpd2dJbXB2YUc1a2IyVkFaWGhoYlhCc1pTNWpiMjBpWFEiLCAiaGFzaD1XeUp6WVd4MElpd2dJbVpoYldsc2VWOXVZVzFsSWl3Z0lrUnZaU0pkIiwgImhhc2g9V3lKellXeDBJaXdnSW1kcGRtVnVYMjVoYldVaUxDQWlTbTlvYmlKZCIsICJoYXNoPVd5SnpZV3gwSWl3Z0ltbHpYMjkyWlhKZk1UZ2lMQ0IwY25WbFhRIiwgImhhc2g9V3lKellXeDBJaXdnSW1selgyOTJaWEpmTWpFaUxDQjBjblZsWFEiLCAiaGFzaD1XeUp6WVd4MElpd2dJbWx6WDI5MlpYSmZOalVpTENCMGNuVmxYUSIsICJoYXNoPVd5SnpZV3gwSWl3Z0luQm9iMjVsWDI1MWJXSmxjaUlzSUNJck1TMHlNREl0TlRVMUxUQXhNREVpWFEiXX0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~'
            )
        })

        it('create simple sd-jwt-vc with key binding', async () => {
            const sdJwtVc = SdJwtVc.fromCompact(
                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ0eXBlIjogIklkZW50aXR5Q3JlZGVudGlhbCIsICJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9pc3N1ZXIiLCAiaWF0IjogMTY5ODA1NjExMCwiY25mIjogeyJqd2siOiB7ImNydiI6ICJFZDI1NTE5IiwgIngiOiAiQ2lyWm4tVjluX0tSaDhjMkl5V3FPdHJWbTl3bHphVkREUzhZNHpHbVFzbyIsICJrdHkiOiAiT0tQIn19LCJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJoYXNoPVd5SnpZV3gwSWl3Z0ltRmtaSEpsYzNNaUxDQjdJbk4wY21WbGRGOWhaR1J5WlhOeklqb2dJakV5TXlCTllXbHVJRk4wSWl3Z0lteHZZMkZzYVhSNUlqb2dJa0Z1ZVhSdmQyNGlMQ0FpY21WbmFXOXVJam9nSWtGdWVYTjBZWFJsSWl3Z0ltTnZkVzUwY25raU9pQWlWVk1pZlYwIiwgImhhc2g9V3lKellXeDBJaXdnSW1KcGNuUm9aR0YwWlNJc0lDSXhPVFF3TFRBeExUQXhJbDAiLCAiaGFzaD1XeUp6WVd4MElpd2dJbVZ0WVdsc0lpd2dJbXB2YUc1a2IyVkFaWGhoYlhCc1pTNWpiMjBpWFEiLCAiaGFzaD1XeUp6WVd4MElpd2dJbVpoYldsc2VWOXVZVzFsSWl3Z0lrUnZaU0pkIiwgImhhc2g9V3lKellXeDBJaXdnSW1kcGRtVnVYMjVoYldVaUxDQWlTbTlvYmlKZCIsICJoYXNoPVd5SnpZV3gwSWl3Z0ltbHpYMjkyWlhKZk1UZ2lMQ0IwY25WbFhRIiwgImhhc2g9V3lKellXeDBJaXdnSW1selgyOTJaWEpmTWpFaUxDQjBjblZsWFEiLCAiaGFzaD1XeUp6WVd4MElpd2dJbWx6WDI5MlpYSmZOalVpTENCMGNuVmxYUSIsICJoYXNoPVd5SnpZV3gwSWl3Z0luQm9iMjVsWDI1MWJXSmxjaUlzSUNJck1TMHlNREl0TlRVMUxUQXhNREVpWFEiXX0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~'
            )

            const keyBinding = new KeyBinding<
                Record<string, unknown>,
                Record<string, unknown>
            >({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'kb+jwt'
                },
                payload: {
                    aud: 'https://example.org/audience',
                    iat: 1698056120,
                    nonce: 'some-nonce'
                }
            }).withSigner(() => new Uint8Array(32).fill(42))

            const sdJwtVcWithKeyBinding = sdJwtVc.withKeyBinding(keyBinding)

            const compact = await sdJwtVc.toCompact()
            const compactWithKeyBinding =
                await sdJwtVcWithKeyBinding.toCompact()
            const compactKeyBinding = await keyBinding.toCompact()

            strictEqual(
                compactWithKeyBinding,
                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ0eXBlIjogIklkZW50aXR5Q3JlZGVudGlhbCIsICJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9pc3N1ZXIiLCAiaWF0IjogMTY5ODA1NjExMCwiY25mIjogeyJqd2siOiB7ImNydiI6ICJFZDI1NTE5IiwgIngiOiAiQ2lyWm4tVjluX0tSaDhjMkl5V3FPdHJWbTl3bHphVkREUzhZNHpHbVFzbyIsICJrdHkiOiAiT0tQIn19LCJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJoYXNoPVd5SnpZV3gwSWl3Z0ltRmtaSEpsYzNNaUxDQjdJbk4wY21WbGRGOWhaR1J5WlhOeklqb2dJakV5TXlCTllXbHVJRk4wSWl3Z0lteHZZMkZzYVhSNUlqb2dJa0Z1ZVhSdmQyNGlMQ0FpY21WbmFXOXVJam9nSWtGdWVYTjBZWFJsSWl3Z0ltTnZkVzUwY25raU9pQWlWVk1pZlYwIiwgImhhc2g9V3lKellXeDBJaXdnSW1KcGNuUm9aR0YwWlNJc0lDSXhPVFF3TFRBeExUQXhJbDAiLCAiaGFzaD1XeUp6WVd4MElpd2dJbVZ0WVdsc0lpd2dJbXB2YUc1a2IyVkFaWGhoYlhCc1pTNWpiMjBpWFEiLCAiaGFzaD1XeUp6WVd4MElpd2dJbVpoYldsc2VWOXVZVzFsSWl3Z0lrUnZaU0pkIiwgImhhc2g9V3lKellXeDBJaXdnSW1kcGRtVnVYMjVoYldVaUxDQWlTbTlvYmlKZCIsICJoYXNoPVd5SnpZV3gwSWl3Z0ltbHpYMjkyWlhKZk1UZ2lMQ0IwY25WbFhRIiwgImhhc2g9V3lKellXeDBJaXdnSW1selgyOTJaWEpmTWpFaUxDQjBjblZsWFEiLCAiaGFzaD1XeUp6WVd4MElpd2dJbWx6WDI5MlpYSmZOalVpTENCMGNuVmxYUSIsICJoYXNoPVd5SnpZV3gwSWl3Z0luQm9iMjVsWDI1MWJXSmxjaUlzSUNJck1TMHlNREl0TlRVMUxUQXhNREVpWFEiXX0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~eyJhbGciOiAiRWREU0EiLCAidHlwIjogImtiK2p3dCJ9.eyJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSIsICJpYXQiOiAxNjk4MDU2MTIwLCJub25jZSI6ICJzb21lLW5vbmNlIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )

            assert(compactWithKeyBinding.endsWith(compactKeyBinding))
            assert(compactWithKeyBinding.startsWith(compact))
        })
    })

    describe('sd-jwt-vc validation', async () => {
        it('validate that required claim (iss) are included in payload', async () => {
            const cnf = publicHolderKeyJwk

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    type: 'IdentityCredential',
                    iat: 1698056110,
                    cnf,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(() => new Uint8Array(32).fill(42))
                .withHasher({
                    hasher: (input: string) => `hash=${input}`,
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            await rejects(
                async () => await sdJwtVc.toCompact(),
                new SdJwtVcError(
                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'iss' not found in any level within the payload"
                )
            )
        })

        it('validate that required claim (type) are included in payload', async () => {
            const cnf = publicHolderKeyJwk

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    cnf,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(() => new Uint8Array(32).fill(42))
                .withHasher({
                    hasher: (input: string) => `hash=${input}`,
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            await rejects(
                async () => await sdJwtVc.toCompact(),
                new SdJwtVcError(
                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'type' not found in any level within the payload"
                )
            )
        })

        it('validate that required claim (iat) are included in payload', async () => {
            const cnf = publicHolderKeyJwk

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    type: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    cnf,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(() => new Uint8Array(32).fill(42))
                .withHasher({
                    hasher: (input: string) => `hash=${input}`,
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            await rejects(
                async () => await sdJwtVc.toCompact(),
                new SdJwtVcError(
                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'iat' not found in any level within the payload"
                )
            )
        })

        it('validate that required claim (cnf) are included in payload', async () => {
            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    type: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(() => new Uint8Array(32).fill(42))
                .withHasher({
                    hasher: (input: string) => `hash=${input}`,
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            await rejects(
                async () => await sdJwtVc.toCompact(),
                new SdJwtVcError(
                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'cnf' not found in any level within the payload"
                )
            )
        })

        it('validate that required claim (typ) are included in header', async () => {
            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA
                },
                payload: {
                    type: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(() => new Uint8Array(32).fill(42))
                .withHasher({
                    hasher: (input: string) => `hash=${input}`,
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            await rejects(
                async () => await sdJwtVc.toCompact(),
                new SdJwtVcError(
                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'typ' not found in any level within the header"
                )
            )
        })

        it('validate that required claim (alg) are included in header', async () => {
            const sdJwtVc = new SdJwtVc({
                header: {
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    type: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(() => new Uint8Array(32).fill(42))
                .withHasher({
                    hasher: (input: string) => `hash=${input}`,
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            await rejects(
                async () => await sdJwtVc.toCompact(),
                new SdJwtVcError(
                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'alg' not found in any level within the header"
                )
            )
        })

        it('validate that required claim (alg) are included in header', async () => {
            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'invalid-typ'
                },
                payload: {
                    type: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(() => new Uint8Array(32).fill(42))
                .withHasher({
                    hasher: (input: string) => `hash=${input}`,
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            await rejects(
                async () => await sdJwtVc.toCompact(),
                new SdJwtVcError(
                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'typ' was found, but values did not match within the header"
                )
            )
        })
    })

    describe('verify sd-jwt-vc', async () => {
        it('check whether publicKeyJwk is defined when cnf and keybinding are defined', async () => {
            const sdJwtVc = SdJwtVc.fromCompact(
                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ0eXBlIjogIklkZW50aXR5Q3JlZGVudGlhbCIsICJpc3MiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9pc3N1ZXIiLCAiaWF0IjogMTY5ODA1NjExMCwiY25mIjogeyJqd2siOiB7ImNydiI6ICJFZDI1NTE5IiwgIngiOiAiQ2lyWm4tVjluX0tSaDhjMkl5V3FPdHJWbTl3bHphVkREUzhZNHpHbVFzbyIsICJrdHkiOiAiT0tQIn19LCJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJoYXNoPVd5SnpZV3gwSWl3Z0ltRmtaSEpsYzNNaUxDQjdJbk4wY21WbGRGOWhaR1J5WlhOeklqb2dJakV5TXlCTllXbHVJRk4wSWl3Z0lteHZZMkZzYVhSNUlqb2dJa0Z1ZVhSdmQyNGlMQ0FpY21WbmFXOXVJam9nSWtGdWVYTjBZWFJsSWl3Z0ltTnZkVzUwY25raU9pQWlWVk1pZlYwIiwgImhhc2g9V3lKellXeDBJaXdnSW1KcGNuUm9aR0YwWlNJc0lDSXhPVFF3TFRBeExUQXhJbDAiLCAiaGFzaD1XeUp6WVd4MElpd2dJbVZ0WVdsc0lpd2dJbXB2YUc1a2IyVkFaWGhoYlhCc1pTNWpiMjBpWFEiLCAiaGFzaD1XeUp6WVd4MElpd2dJbVpoYldsc2VWOXVZVzFsSWl3Z0lrUnZaU0pkIiwgImhhc2g9V3lKellXeDBJaXdnSW1kcGRtVnVYMjVoYldVaUxDQWlTbTlvYmlKZCIsICJoYXNoPVd5SnpZV3gwSWl3Z0ltbHpYMjkyWlhKZk1UZ2lMQ0IwY25WbFhRIiwgImhhc2g9V3lKellXeDBJaXdnSW1selgyOTJaWEpmTWpFaUxDQjBjblZsWFEiLCAiaGFzaD1XeUp6WVd4MElpd2dJbWx6WDI5MlpYSmZOalVpTENCMGNuVmxYUSIsICJoYXNoPVd5SnpZV3gwSWl3Z0luQm9iMjVsWDI1MWJXSmxjaUlzSUNJck1TMHlNREl0TlRVMUxUQXhNREVpWFEiXX0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~eyJhbGciOiAiRWREU0EiLCAidHlwIjogImtiK2p3dCJ9.eyJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSIsICJpYXQiOiAxNjk4MDU2MTIwLCJub25jZSI6ICJzb21lLW5vbmNlIn0.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
            )

            // Verify that the `publicKeyJwk` is passed in when the JWT is for keybinding
            await sdJwtVc.verify(({ publicKeyJwk, header }) => {
                if (header.typ === 'kb+jwt') assert(publicKeyJwk)
                return true
            })
        })

        it('Validate the sd-jwt-vc with cnf and keybinding', async () => {
            const cnf = publicHolderKeyJwk

            const keyBinding = await new KeyBinding({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'kb+jwt'
                },
                payload: {
                    aud: 'https://example.org/audience',
                    iat: 1698056120,
                    nonce: 'some-nonce'
                }
            })
                .withSigner(keyBindingSigner)
                .toCompact()

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    type: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    cnf,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(signer)
                .withHasher(hasherAndAlgorithm)
                .withSaltGenerator(saltGenerator)
                .withKeyBinding(keyBinding)

            const sdJwtVcWithSignature = await sdJwtVc.signAndAdd()

            const result = await sdJwtVcWithSignature.verify(
                ({ publicKeyJwk, header, message, signature }) => {
                    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
                        throw new Error(
                            `Unsupported algorithm in header: ${header.alg}`
                        )
                    }

                    if (publicKeyJwk) {
                        const publicKey = createPublicKey({
                            key: publicKeyJwk,
                            format: 'jwk'
                        })

                        return verify(
                            null,
                            Buffer.from(message),
                            publicKey,
                            signature
                        )
                    }

                    return verifier({ signature, message, header })
                }
            )

            deepStrictEqual(result, {
                containsRequiredVcProperties: true,
                isSignatureValid: true,
                isValid: true,
                isKeyBindingValid: true
            })
        })

        it('Validate the sd-jwt-vc with cnf and keybinding, where cnf does not match the expected cnf', async () => {
            const cnf = publicHolderKeyJwk

            const keyBinding = await new KeyBinding({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'kb+jwt'
                },
                payload: {
                    aud: 'https://example.org/audience',
                    iat: 1698056120,
                    nonce: 'some-nonce'
                }
            })
                .withSigner(keyBindingSigner)
                .toCompact()

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    type: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    cnf,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(signer)
                .withHasher(hasherAndAlgorithm)
                .withSaltGenerator(saltGenerator)
                .withKeyBinding(keyBinding)

            const sdJwtVcWithSignature = await sdJwtVc.signAndAdd()

            const result = await sdJwtVcWithSignature.verify(
                ({ publicKeyJwk, header, message, signature }) => {
                    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
                        throw new Error(
                            `Unsupported algorithm in header: ${header.alg}`
                        )
                    }

                    if (publicKeyJwk) {
                        const publicKey = createPublicKey({
                            key: publicKeyJwk,
                            format: 'jwk'
                        })

                        return verify(
                            null,
                            Buffer.from(message),
                            publicKey,
                            signature
                        )
                    }

                    return verifier({ signature, message, header })
                }
            )

            deepStrictEqual(result, {
                containsRequiredVcProperties: true,
                isSignatureValid: true,
                isValid: true,
                isKeyBindingValid: true
            })
        })
        it('Validate the sd-jwt-vc with cnf and keybinding', async () => {
            const cnf = publicHolderKeyJwk

            const keyBinding = await new KeyBinding({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'kb+jwt'
                },
                payload: {
                    aud: 'https://example.org/audience',
                    iat: 1698056120,
                    nonce: 'some-nonce'
                }
            })
                .withSigner(keyBindingSigner)
                .toCompact()

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    type: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    cnf,
                    given_name: 'John',
                    family_name: 'Doe',
                    email: 'johndoe@example.com',
                    phone_number: '+1-202-555-0101',
                    address: {
                        street_address: '123 Main St',
                        locality: 'Anytown',
                        region: 'Anystate',
                        country: 'US'
                    },
                    birthdate: '1940-01-01',
                    is_over_18: true,
                    is_over_21: true,
                    is_over_65: true
                }
            })
                .withDisclosureFrame({
                    is_over_65: true,
                    is_over_21: true,
                    is_over_18: true,
                    birthdate: true,
                    email: true,
                    address: true,
                    given_name: true,
                    family_name: true,
                    phone_number: true
                })
                .withSigner(signer)
                .withHasher(hasherAndAlgorithm)
                .withSaltGenerator(saltGenerator)
                .withKeyBinding(keyBinding)

            const sdJwtVcWithSignature = await sdJwtVc.signAndAdd()

            const result = await sdJwtVcWithSignature.verify(
                ({ publicKeyJwk, header, message, signature }) => {
                    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
                        throw new Error(
                            `Unsupported algorithm in header: ${header.alg}`
                        )
                    }

                    if (publicKeyJwk) {
                        const publicKey = createPublicKey({
                            key: publicKeyJwk,
                            format: 'jwk'
                        })

                        return verify(
                            null,
                            Buffer.from(message),
                            publicKey,
                            signature
                        )
                    }

                    return verifier({ signature, message, header })
                },
                [],
                { invalidCnfClaim: { test: 'a' } }
            )

            deepStrictEqual(result, {
                areRequiredClaimsIncluded: true,
                containsRequiredVcProperties: true,
                containsExpectedKeyBinding: false,
                isSignatureValid: true,
                isValid: true,
                isKeyBindingValid: true
            })
        })
    })
})
