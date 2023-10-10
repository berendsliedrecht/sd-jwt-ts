import {
    createHash,
    generateKeyPairSync,
    getRandomValues,
    sign
} from 'node:crypto'

import {
    Signer,
    SaltGenerator,
    HasherAlgorithm,
    HasherAndAlgorithm,
    SdJwt,
    SignatureAndEncryptionAlgorithm,
    KeyBinding
} from '../src'

const { privateKey } = generateKeyPairSync('ed25519')

const hasherAndAlgorithm: HasherAndAlgorithm = {
    hasher: (input: string) =>
        createHash('sha256').update(input).digest().toString('base64url'),

    algorithm: HasherAlgorithm.Sha256
}

const signer: Signer = (input, header) => {
    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }
    return sign(null, Buffer.from(input), privateKey)
}

const saltGenerator: SaltGenerator = () =>
    getRandomValues(Buffer.alloc(16)).toString('base64url')

void (async () => {
    const keyBinding = new KeyBinding(
        {
            header: {
                typ: 'kb+jwt',
                alg: SignatureAndEncryptionAlgorithm.EdDSA
            },
            payload: {
                iat: new Date().getTime(),
                aud: 'did:peer:4:some-verifier',
                nonce: await saltGenerator()
            }
        },
        { signer }
    )

    const sdJwt = new SdJwt<
        { alg: string; typ: string },
        {
            iss: string
            iat: number
            nbf: number
            credentialSubject: string
            credential: { name: string; lastName: string; dateOfBirth: string }
        }
    >({}, { saltGenerator, signer, hasherAndAlgorithm })
        .withKeyBinding(keyBinding)
        .withHeader({
            alg: SignatureAndEncryptionAlgorithm.EdDSA,
            typ: 'sd-jwt'
        })
        .withPayload({
            iat: new Date().getTime(),
            iss: `did:key:some-random-did-key`,
            nbf: new Date().getTime() + 100,
            credentialSubject: 'did:peer:4receiver-peer-did',
            credential: {
                name: 'John',
                lastName: 'Doe',
                dateOfBirth: '20000101'
            }
        })
        .withDisclosureFrame({
            credentialSubject: true,
            __decoyCount: 2,
            credential: {
                __decoyCount: 3,
                dateOfBirth: true,
                name: true,
                lastName: true
            }
        })

    const sdJwtCompact = await sdJwt.toCompact()

    console.log('==================== COMPACT SD-JWT ====================')
    console.log(sdJwtCompact)
    console.log('========================================================')

    const sdJwtFromCompact = SdJwt.fromCompact<
        typeof sdJwt.header,
        typeof sdJwt.payload
    >(sdJwtCompact)

    console.log('\n')
    console.log('==================== EXPANDED SD-JWT ====================')
    console.log({
        header: sdJwtFromCompact.header,
        payload: sdJwtFromCompact.payload,
        signature: sdJwtFromCompact.signature,
        disclosures: sdJwtFromCompact.disclosures,
        keyBinding: {
            header: sdJwtFromCompact.keyBinding?.header,
            payload: sdJwtFromCompact.keyBinding?.payload,
            signature: sdJwtFromCompact.keyBinding?.signature
        }
    })
    console.log('=========================================================')
})()
