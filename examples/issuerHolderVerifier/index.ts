import {
    createHash,
    generateKeyPairSync,
    getRandomValues,
    sign,
    verify
} from 'node:crypto'

import {
    HasherAlgorithm,
    HasherAndAlgorithm,
    SaltGenerator,
    SdJwt,
    SignatureAndEncryptionAlgorithm,
    Signer,
    Verifier
} from '@sd-jwt/core'

const { privateKey, publicKey } = generateKeyPairSync('ed25519')

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

const verifyCb: Verifier = ({ header, message, signature }) => {
    if (header.alg !== SignatureAndEncryptionAlgorithm.EdDSA) {
        throw new Error('only EdDSA is supported')
    }

    return verify(null, Buffer.from(message), publicKey, signature)
}

const saltGenerator: SaltGenerator = () =>
    getRandomValues(Buffer.alloc(16)).toString('base64url')

const payload = {
    iss: 'https://issuer.org/issuer-123',
    sub: 'https://holder.org/holder-321',
    aud: 'https://verifier.org/verifier-987',
    nbf: Math.floor(new Date().getTime() / 1000 - 1000),
    exp: Math.floor(new Date().getTime() / 1000 + 1000),
    age_over_21: true,
    age_over_24: true,
    age_over_65: false,
    address: {
        locality: 'Maxstadt',
        postal_code: '12344',
        country: 'DE',
        street_address: 'Weidenstraße 22'
    }
} as const

const issuer = async () => {
    console.log('====== ISSUER ======')

    const sdJwt = new SdJwt({
        header: { alg: SignatureAndEncryptionAlgorithm.EdDSA },
        payload
    })
        .withHasher(hasherAndAlgorithm)
        .withSigner(signer)
        .withSaltGenerator(saltGenerator)
        .withDisclosureFrame({
            __decoyCount: 2,
            age_over_21: true,
            age_over_24: true,
            age_over_65: true,
            address: {
                __decoyCount: 3,
                locality: true
            }
        })

    const compact = await sdJwt.toCompact()

    console.log('Issuing: ')
    console.log('=========')
    console.log(compact)
    console.log('=========')

    return compact
}

const holder = async (compact: string) => {
    console.log('====== HOLDER ======')

    const sdJwt = SdJwt.fromCompact<Record<string, unknown>, typeof payload>(
        compact
    ).withHasher(hasherAndAlgorithm)

    console.log('Claims: ')
    console.log('========')
    console.log(await sdJwt.getPrettyClaims())
    console.log('========')
    console.log()

    const presentationFrame = {
        age_over_24: true
    } as const

    console.log('Presentation Frame:')
    console.log('========')
    console.log(presentationFrame)
    console.log('========')
    console.log()

    const presentation = await sdJwt.present(presentationFrame)

    console.log('Presenting: ')
    console.log('============')
    console.log(presentation)
    console.log('============')

    return presentation
}

const verifier = async (presentation: string) => {
    const sdJwt = SdJwt.fromCompact(presentation).withHasher(hasherAndAlgorithm)

    const verificationResult = await sdJwt.verify(verifyCb, [
        'iss',
        'aud',
        'sub',
        'address',
        'age_over_24'
    ])

    console.log('Claims: ')
    console.log('========')
    console.log(await sdJwt.getPrettyClaims())
    console.log('========')

    console.log('Verification: ')
    console.log('==============')
    console.log(verificationResult)
    console.log('==============')
}

void (async () => {
    const sdJwt = await issuer()
    const presentation = await holder(sdJwt)
    await verifier(presentation)
})()
