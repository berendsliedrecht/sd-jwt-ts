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
    SignatureAndEncryptionAlgorithm
} from '../src'

const { privateKey } = generateKeyPairSync('ed25519')

const hasherAndAlgorithm: HasherAndAlgorithm = {
    hasher: (input: string) => createHash('sha256').update(input).digest(),
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
    const sdJwt = new SdJwt(
        {
            header: {
                alg: SignatureAndEncryptionAlgorithm.EdDSA,
                typ: 'sd-jwt'
            },
            payload: {
                iss: 'https://example.org/issuer',
                sub: 'https://example.org/sub',
                iat: new Date().getTime(),
                age: 25
            }
        },
        {
            saltGenerator,
            signer,
            hasherAndAlgorithm,
            disclosureFrame: { age: true, __decoyCount: 2 }
        }
    )

    const sdJwtCompact = await sdJwt.toCompact()

    console.log('==================== COMPACT SD-JWT ====================')
    console.log(sdJwtCompact)
    console.log('========================================================')

    const sdJwtFromCompact = SdJwt.fromCompact(sdJwtCompact)

    console.log('\n')
    console.log('==================== EXPANDED SD-JWT ====================')
    console.log({
        header: sdJwtFromCompact.header,
        payload: sdJwtFromCompact.payload,
        signature: sdJwtFromCompact.signature,
        disclosures: sdJwtFromCompact.disclosures
    })
    console.log('=========================================================')
})()
