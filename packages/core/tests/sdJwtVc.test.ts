import { before, describe, it } from 'node:test'
import { createPublicKey, verify } from 'node:crypto'
import assert, {
    deepStrictEqual,
    doesNotThrow,
    rejects,
    strictEqual
} from 'node:assert'
import {
    hasherAndAlgorithm,
    issuerPublicKeyJwk,
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
import { Base64url } from '@sd-jwt/utils'
import { calculateSdHash } from '@sd-jwt/decode'

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
                    vct: 'IdentityCredential',
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
                    hasher: (data) => Buffer.from(data),
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            const compact = await sdJwtVc.toCompact()

            strictEqual(
                compact,
                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ2Y3QiOiAiSWRlbnRpdHlDcmVkZW50aWFsIiwgImlzcyI6ICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciIsICJpYXQiOiAxNjk4MDU2MTEwLCJjbmYiOiB7Imp3ayI6IHsiY3J2IjogIkVkMjU1MTkiLCAia3R5IjogIk9LUCIsICJ4IjogIkNpclpuLVY5bl9LUmg4YzJJeVdxT3RyVm05d2x6YVZERFM4WTR6R21Rc28ifX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbIlYzbEtlbGxYZURCSmFYZG5TVzFHYTFwSVNteGpNMDFwVEVOQ04wbHVUakJqYlZac1pFWTVhRnBIVW5sYVdFNTZTV3B2WjBscVJYbE5lVUpPV1Zkc2RVbEdUakJKYVhkblNXMTRkbGt5Um5OaFdGSTFTV3B2WjBsclJuVmxXRkoyWkRJMGFVeERRV2xqYlZadVlWYzVkVWxxYjJkSmEwWjFaVmhPTUZsWVVteEphWGRuU1cxT2RtUlhOVEJqYm10cFQybEJhVlpXVFdsbVZqQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxS2NHTnVVbTlhUjBZd1dsTkpjMGxEU1hoUFZGRjNURlJCZUV4VVFYaEpiREEiLCAiVjNsS2VsbFhlREJKYVhkblNXMVdkRmxYYkhOSmFYZG5TVzF3ZG1GSE5XdGlNbFpCV2xob2FHSllRbk5hVXpWcVlqSXdhVmhSIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFhYUdKWGJITmxWamwxV1ZjeGJFbHBkMmRKYTFKMldsTktaQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxa2NHUnRWblZZTWpWb1lsZFZhVXhEUVdsVGJUbHZZbWxLWkEiLCAiVjNsS2VsbFhlREJKYVhkblNXMXNlbGd5T1RKYVdFcG1UVlJuYVV4RFFqQmpibFpzV0ZFIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFzZWxneU9USmFXRXBtVFdwRmFVeERRakJqYmxac1dGRSIsICJWM2xLZWxsWGVEQkphWGRuU1cxc2VsZ3lPVEphV0VwbVRtcFZhVXhEUWpCamJsWnNXRkUiLCAiVjNsS2VsbFhlREJKYVhkblNXNUNiMkl5Tld4WU1qVXhZbGRLYkdOcFNYTkpRMGx5VFZNd2VVMUVTWFJPVkZVeFRGUkJlRTFFUldsWVVRIl19.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~'
            )
        })

        it('create simple sd-jwt-vc with key binding', async () => {
            const sdJwtVc = SdJwtVc.fromCompact(
                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ2Y3QiOiAiSWRlbnRpdHlDcmVkZW50aWFsIiwgImlzcyI6ICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciIsICJpYXQiOiAxNjk4MDU2MTEwLCJjbmYiOiB7Imp3ayI6IHsiY3J2IjogIkVkMjU1MTkiLCAia3R5IjogIk9LUCIsICJ4IjogIkNpclpuLVY5bl9LUmg4YzJJeVdxT3RyVm05d2x6YVZERFM4WTR6R21Rc28ifX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbIlYzbEtlbGxYZURCSmFYZG5TVzFHYTFwSVNteGpNMDFwVEVOQ04wbHVUakJqYlZac1pFWTVhRnBIVW5sYVdFNTZTV3B2WjBscVJYbE5lVUpPV1Zkc2RVbEdUakJKYVhkblNXMTRkbGt5Um5OaFdGSTFTV3B2WjBsclJuVmxXRkoyWkRJMGFVeERRV2xqYlZadVlWYzVkVWxxYjJkSmEwWjFaVmhPTUZsWVVteEphWGRuU1cxT2RtUlhOVEJqYm10cFQybEJhVlpXVFdsbVZqQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxS2NHTnVVbTlhUjBZd1dsTkpjMGxEU1hoUFZGRjNURlJCZUV4VVFYaEpiREEiLCAiVjNsS2VsbFhlREJKYVhkblNXMVdkRmxYYkhOSmFYZG5TVzF3ZG1GSE5XdGlNbFpCV2xob2FHSllRbk5hVXpWcVlqSXdhVmhSIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFhYUdKWGJITmxWamwxV1ZjeGJFbHBkMmRKYTFKMldsTktaQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxa2NHUnRWblZZTWpWb1lsZFZhVXhEUVdsVGJUbHZZbWxLWkEiLCAiVjNsS2VsbFhlREJKYVhkblNXMXNlbGd5T1RKYVdFcG1UVlJuYVV4RFFqQmpibFpzV0ZFIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFzZWxneU9USmFXRXBtVFdwRmFVeERRakJqYmxac1dGRSIsICJWM2xLZWxsWGVEQkphWGRuU1cxc2VsZ3lPVEphV0VwbVRtcFZhVXhEUWpCamJsWnNXRkUiLCAiVjNsS2VsbFhlREJKYVhkblNXNUNiMkl5Tld4WU1qVXhZbGRLYkdOcFNYTkpRMGx5VFZNd2VVMUVTWFJPVkZVeFRGUkJlRTFFUldsWVVRIl19.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~'
            ).withHasher(hasherAndAlgorithm)

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

            const compact = await sdJwtVc.toCompact()

            // Add key binding
            sdJwtVc.withKeyBinding(keyBinding)
            const compactWithKeyBinding = await sdJwtVc.toCompact()

            const compactKeyBinding = await keyBinding.toCompact()

            strictEqual(
                compactWithKeyBinding,
                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ2Y3QiOiAiSWRlbnRpdHlDcmVkZW50aWFsIiwgImlzcyI6ICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciIsICJpYXQiOiAxNjk4MDU2MTEwLCJjbmYiOiB7Imp3ayI6IHsiY3J2IjogIkVkMjU1MTkiLCAia3R5IjogIk9LUCIsICJ4IjogIkNpclpuLVY5bl9LUmg4YzJJeVdxT3RyVm05d2x6YVZERFM4WTR6R21Rc28ifX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbIlYzbEtlbGxYZURCSmFYZG5TVzFHYTFwSVNteGpNMDFwVEVOQ04wbHVUakJqYlZac1pFWTVhRnBIVW5sYVdFNTZTV3B2WjBscVJYbE5lVUpPV1Zkc2RVbEdUakJKYVhkblNXMTRkbGt5Um5OaFdGSTFTV3B2WjBsclJuVmxXRkoyWkRJMGFVeERRV2xqYlZadVlWYzVkVWxxYjJkSmEwWjFaVmhPTUZsWVVteEphWGRuU1cxT2RtUlhOVEJqYm10cFQybEJhVlpXVFdsbVZqQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxS2NHTnVVbTlhUjBZd1dsTkpjMGxEU1hoUFZGRjNURlJCZUV4VVFYaEpiREEiLCAiVjNsS2VsbFhlREJKYVhkblNXMVdkRmxYYkhOSmFYZG5TVzF3ZG1GSE5XdGlNbFpCV2xob2FHSllRbk5hVXpWcVlqSXdhVmhSIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFhYUdKWGJITmxWamwxV1ZjeGJFbHBkMmRKYTFKMldsTktaQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxa2NHUnRWblZZTWpWb1lsZFZhVXhEUVdsVGJUbHZZbWxLWkEiLCAiVjNsS2VsbFhlREJKYVhkblNXMXNlbGd5T1RKYVdFcG1UVlJuYVV4RFFqQmpibFpzV0ZFIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFzZWxneU9USmFXRXBtVFdwRmFVeERRakJqYmxac1dGRSIsICJWM2xLZWxsWGVEQkphWGRuU1cxc2VsZ3lPVEphV0VwbVRtcFZhVXhEUWpCamJsWnNXRkUiLCAiVjNsS2VsbFhlREJKYVhkblNXNUNiMkl5Tld4WU1qVXhZbGRLYkdOcFNYTkpRMGx5VFZNd2VVMUVTWFJPVkZVeFRGUkJlRTFFUldsWVVRIl19.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~eyJhbGciOiAiRWREU0EiLCAidHlwIjogImtiK2p3dCJ9.eyJhdWQiOiAiaHR0cHM6Ly9leGFtcGxlLm9yZy9hdWRpZW5jZSIsICJpYXQiOiAxNjk4MDU2MTIwLCJub25jZSI6ICJzb21lLW5vbmNlIiwgIl9zZF9oYXNoIjogImJSdllfMU9Tc3JlYXEtNHFtZGJxLWFrUy1PeGR3b1hfMUVkQkMxeUxzdzAifQ.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio'
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
                    vct: 'IdentityCredential',
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
                    hasher: (data) => Buffer.from(data),
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

        it('validate that required claim (vct) are included in payload', async () => {
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
                    hasher: (data) => Buffer.from(data),
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            await rejects(
                async () => await sdJwtVc.toCompact(),
                new SdJwtVcError(
                    "jwt is not valid for usage with sd-jwt-vc. Error: Claim key 'vct' not found in any level within the payload"
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
                    vct: 'IdentityCredential',
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
                    hasher: (data) => Buffer.from(data),
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

        it('validate that required claim (typ) are included in header', async () => {
            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA
                },
                payload: {
                    vct: 'IdentityCredential',
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
                    hasher: (data) => Buffer.from(data),
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
                    vct: 'IdentityCredential',
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
                    hasher: (data) => Buffer.from(data),
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

        it('validate that required claim (typ) are included in header', async () => {
            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'invalid-typ'
                },
                payload: {
                    vct: 'IdentityCredential',
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
                    hasher: (data) => Buffer.from(data),
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

        it('validate that non selectively discloseable claims (iss, iat, nbf, exp, cnf, vct, status) are not disclosed', async () => {
            const disclosureFrame = {
                is_over_65: true,
                is_over_21: true,
                is_over_18: true,
                birthdate: true,
                email: true,
                address: true,
                given_name: true,
                family_name: true,
                phone_number: true
            } as const
            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    vct: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    cnf: publicHolderKeyJwk,
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
                .withSigner(() => new Uint8Array(32).fill(42))
                .withHasher({
                    hasher: (data) => Buffer.from(data),
                    algorithm: HasherAlgorithm.Sha256
                })
                .withSaltGenerator(() => 'salt')

            for (const claimKey of [
                'iss',
                'iat',
                'nbf',
                'exp',
                'cnf',
                'vct',
                'status'
            ]) {
                await rejects(
                    async () =>
                        await sdJwtVc
                            .withDisclosureFrame({
                                ...disclosureFrame,
                                [claimKey]: true
                            })
                            .toCompact(),
                    new SdJwtVcError(
                        `jwt is not valid for usage with sd-jwt-vc. Error: Claim key '${claimKey}' was found in the disclosure frame. This claim is not allowed to be selectively disclosed`
                    )
                )
            }
        })
    })

    describe('verify sd-jwt-vc', async () => {
        it('check whether publicKeyJwk is defined when cnf and keybinding are defined', async () => {
            const sdJwtVc = SdJwtVc.fromCompact(
                'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ2Y3QiOiAiSWRlbnRpdHlDcmVkZW50aWFsIiwgImlzcyI6ICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciIsICJpYXQiOiAxNjk4MDU2MTEwLCJjbmYiOiB7Imp3ayI6IHsiY3J2IjogIkVkMjU1MTkiLCAia3R5IjogIk9LUCIsICJ4IjogIkNpclpuLVY5bl9LUmg4YzJJeVdxT3RyVm05d2x6YVZERFM4WTR6R21Rc28ifX0sIl9zZF9hbGciOiAic2hhLTI1NiIsICJfc2QiOiBbIlYzbEtlbGxYZURCSmFYZG5TVzFHYTFwSVNteGpNMDFwVEVOQ04wbHVUakJqYlZac1pFWTVhRnBIVW5sYVdFNTZTV3B2WjBscVJYbE5lVUpPV1Zkc2RVbEdUakJKYVhkblNXMTRkbGt5Um5OaFdGSTFTV3B2WjBsclJuVmxXRkoyWkRJMGFVeERRV2xqYlZadVlWYzVkVWxxYjJkSmEwWjFaVmhPTUZsWVVteEphWGRuU1cxT2RtUlhOVEJqYm10cFQybEJhVlpXVFdsbVZqQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxS2NHTnVVbTlhUjBZd1dsTkpjMGxEU1hoUFZGRjNURlJCZUV4VVFYaEpiREEiLCAiVjNsS2VsbFhlREJKYVhkblNXMVdkRmxYYkhOSmFYZG5TVzF3ZG1GSE5XdGlNbFpCV2xob2FHSllRbk5hVXpWcVlqSXdhVmhSIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFhYUdKWGJITmxWamwxV1ZjeGJFbHBkMmRKYTFKMldsTktaQSIsICJWM2xLZWxsWGVEQkphWGRuU1cxa2NHUnRWblZZTWpWb1lsZFZhVXhEUVdsVGJUbHZZbWxLWkEiLCAiVjNsS2VsbFhlREJKYVhkblNXMXNlbGd5T1RKYVdFcG1UVlJuYVV4RFFqQmpibFpzV0ZFIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFzZWxneU9USmFXRXBtVFdwRmFVeERRakJqYmxac1dGRSIsICJWM2xLZWxsWGVEQkphWGRuU1cxc2VsZ3lPVEphV0VwbVRtcFZhVXhEUWpCamJsWnNXRkUiLCAiVjNsS2VsbFhlREJKYVhkblNXNUNiMkl5Tld4WU1qVXhZbGRLYkdOcFNYTkpRMGx5VFZNd2VVMUVTWFJPVkZVeFRGUkJlRTFFUldsWVVRIl19.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~'
            )

            // Verify that the `publicKeyJwk` is passed in when the JWT is for keybinding
            await sdJwtVc.verify(({ publicKeyJwk, header }) => {
                if (header.typ === 'kb+jwt') assert(publicKeyJwk)
                return true
            })
        })

        it('Validate the sd-jwt-vc with cnf and keybinding', async () => {
            const cnf = publicHolderKeyJwk

            // We don't sign yet, so the SdJwtVc can calculate the _sd_hash
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
                .withSdHashClaim('hash')
                .withSigner(keyBindingSigner)
                .toCompact()

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    vct: 'IdentityCredential',
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

            // Set expected sd_hash (as actual hash is different)
            sdJwtVc.keyBinding.withExpectedSdHash('hash')

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
                .withSdHashClaim('hash')
                .toCompact()

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    vct: 'IdentityCredential',
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

            // Set expected sd_hash (as actual hash is different)
            sdJwtVc.keyBinding.withExpectedSdHash('hash')

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
                isValid: false,
                isKeyBindingValid: true
            })
        })

        it('Validate the sd-jwt-vc with cnf and keybinding but with issuer and kb public key jwk passed in', async () => {
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
                .withSdHashClaim('hash')
                .withSigner(keyBindingSigner)
                .toCompact()

            const sdJwtVc = new SdJwtVc({
                header: {
                    alg: SignatureAndEncryptionAlgorithm.EdDSA,
                    typ: 'vc+sd-jwt'
                },
                payload: {
                    vct: 'IdentityCredential',
                    iss: 'https://example.org/issuer',
                    iat: 1698056110,
                    cnf: {
                        kid: 'https://example.org/holder'
                    },
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

            // Set expected sd_hash (as actual hash is different)
            sdJwtVc.keyBinding.withExpectedSdHash('hash')

            const sdJwtVcWithSignature = await sdJwtVc.signAndAdd()

            const result = await sdJwtVcWithSignature.verify(
                ({ publicKeyJwk, header, message, signature }) => {
                    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
                        throw new Error(
                            `Unsupported algorithm in header: ${header.alg}`
                        )
                    }

                    if (!publicKeyJwk) {
                        throw new Error('Expecting publicKeyJwk to be defined')
                    }

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
                },
                undefined,
                { kid: 'https://example.org/holder' },
                publicHolderKeyJwk.jwk,
                issuerPublicKeyJwk
            )

            deepStrictEqual(result, {
                containsRequiredVcProperties: true,
                containsExpectedKeyBinding: true,
                isSignatureValid: true,
                isValid: true,
                isKeyBindingValid: true
            })
        })
    })

    describe('sd-jwt-vc from compact', () => {
        it('is allowed to have a sd-jwt-vc without cnf claim', () => {
            doesNotThrow(() =>
                SdJwtVc.fromCompact(
                    'eyJhbGciOiAiRWREU0EiLCAidHlwIjogInZjK3NkLWp3dCJ9.eyJ2Y3QiOiAiSWRlbnRpdHlDcmVkZW50aWFsIiwgImlzcyI6ICJodHRwczovL2V4YW1wbGUub3JnL2lzc3VlciIsICJpYXQiOiAxNjk4MDU2MTEwLCJfc2RfYWxnIjogInNoYS0yNTYiLCAiX3NkIjogWyJWM2xLZWxsWGVEQkphWGRuU1cxR2ExcElTbXhqTTAxcFRFTkNOMGx1VGpCamJWWnNaRVk1YUZwSFVubGFXRTU2U1dwdlowbHFSWGxOZVVKT1dWZHNkVWxHVGpCSmFYZG5TVzE0ZGxreVJuTmhXRkkxU1dwdlowbHJSblZsV0ZKMlpESTBhVXhEUVdsamJWWnVZVmM1ZFVscWIyZEphMFoxWlZoT01GbFlVbXhKYVhkblNXMU9kbVJYTlRCamJtdHBUMmxCYVZaV1RXbG1WakEiLCAiVjNsS2VsbFhlREJKYVhkblNXMUtjR051VW05YVIwWXdXbE5KYzBsRFNYaFBWRkYzVEZSQmVFeFVRWGhKYkRBIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFXZEZsWGJITkphWGRuU1cxd2RtRkhOV3RpTWxaQldsaG9hR0pZUW5OYVV6VnFZakl3YVZoUiIsICJWM2xLZWxsWGVEQkphWGRuU1cxYWFHSlhiSE5sVmpsMVdWY3hiRWxwZDJkSmExSjJXbE5LWkEiLCAiVjNsS2VsbFhlREJKYVhkblNXMWtjR1J0Vm5WWU1qVm9ZbGRWYVV4RFFXbFRiVGx2WW1sS1pBIiwgIlYzbEtlbGxYZURCSmFYZG5TVzFzZWxneU9USmFXRXBtVFZSbmFVeERRakJqYmxac1dGRSIsICJWM2xLZWxsWGVEQkphWGRuU1cxc2VsZ3lPVEphV0VwbVRXcEZhVXhEUWpCamJsWnNXRkUiLCAiVjNsS2VsbFhlREJKYVhkblNXMXNlbGd5T1RKYVdFcG1UbXBWYVV4RFFqQmpibFpzV0ZFIiwgIlYzbEtlbGxYZURCSmFYZG5TVzVDYjJJeU5XeFlNalV4WWxkS2JHTnBTWE5KUTBseVRWTXdlVTFFU1hST1ZGVXhURlJCZUUxRVJXbFlVUSJdfQ.KioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKio~WyJzYWx0IiwgImlzX292ZXJfNjUiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMjEiLCB0cnVlXQ~WyJzYWx0IiwgImlzX292ZXJfMTgiLCB0cnVlXQ~WyJzYWx0IiwgImJpcnRoZGF0ZSIsICIxOTQwLTAxLTAxIl0~WyJzYWx0IiwgImVtYWlsIiwgImpvaG5kb2VAZXhhbXBsZS5jb20iXQ~WyJzYWx0IiwgImFkZHJlc3MiLCB7InN0cmVldF9hZGRyZXNzIjogIjEyMyBNYWluIFN0IiwgImxvY2FsaXR5IjogIkFueXRvd24iLCAicmVnaW9uIjogIkFueXN0YXRlIiwgImNvdW50cnkiOiAiVVMifV0~WyJzYWx0IiwgImdpdmVuX25hbWUiLCAiSm9obiJd~WyJzYWx0IiwgImZhbWlseV9uYW1lIiwgIkRvZSJd~WyJzYWx0IiwgInBob25lX251bWJlciIsICIrMS0yMDItNTU1LTAxMDEiXQ~'
                )
            )
        })
    })
})
