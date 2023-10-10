import { generateKeyPairSync, sign } from 'node:crypto'

import { Signer, SdJwt, SignatureAndEncryptionAlgorithm } from '../src'

const { privateKey } = generateKeyPairSync('ed25519')

const signer: Signer = (input, header) => {
    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }
    return sign(null, Buffer.from(input), privateKey)
}

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
                iat: new Date().getTime()
            }
        },
        { signer }
    )

    const sdJwtCompact = await sdJwt.toCompact()

    console.log('==================== COMPACT JWT ====================')
    console.log(sdJwtCompact)
    console.log('========================================================')

    const sdJwtFromCompact = SdJwt.fromCompact(sdJwtCompact)

    console.log('\n')
    console.log('==================== EXPANDED JWT ====================')
    console.log({
        header: sdJwtFromCompact.header,
        payload: sdJwtFromCompact.payload,
        signature: sdJwtFromCompact.signature,
        disclosures: sdJwtFromCompact.disclosures
    })
    console.log('=========================================================')
})()
