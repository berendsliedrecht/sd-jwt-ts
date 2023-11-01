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
} from '../src'

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

const issuer = async () => {
    console.log('====== ISSUER ======')

    const sdJwt = new SdJwt({
        header: { alg: SignatureAndEncryptionAlgorithm.EdDSA },
        payload: {
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://w3id.org/citizenship/v1',
                'https://w3id.org/security/bbs/v1'
            ],
            id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
            type: ['VerifiableCredential', 'PermanentResidentCard'],
            issuer: 'did:key:zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN',
            identifier: '83627465',
            name: 'Permanent Resident Card',
            description: 'Government of Example Permanent Resident Card.',
            issuanceDate: '2019-12-03T12:19:52Z',
            expirationDate: '2029-12-03T12:19:52Z',
            credentialSubject: {
                id: 'did:example:b34ca6cd37bbf23',
                type: ['PermanentResident', 'Person'],
                givenName: 'JOHN',
                familyName: 'SMITH',
                gender: 'Male',
                image: 'data:image/png;base64,iVBORw0KGgokJggg==',
                residentSince: '2015-01-01',
                lprCategory: 'C09',
                lprNumber: '999-999-999',
                commuterClassification: 'C1',
                birthCountry: 'Bahamas',
                birthDate: '1958-07-17'
            },
            proof: {
                type: 'BbsBlsSignature2020',
                created: '2022-04-13T13:47:47Z',
                verificationMethod:
                    'did:key:zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN#zUC74VEqqhEHQcgv4zagSPkqFJxuNWuoBPKjJuHETEUeHLoSqWt92viSsmaWjy82y2cgguc8e9hsGBifnVK67pQ4gve3m6iSboDkmJjxVEb1d6mRAx5fpMAejooNzNqqbTMVeUN',
                proofPurpose: 'assertionMethod',
                proofValue:
                    'hoNNnnRIoEoaY9Fvg3pGVG2eWTAHnR1kIM01nObEL2FdI2IkkpM3246jn3VBD8KBYUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ=='
            }
        }
    })
        .withHasher(hasherAndAlgorithm)
        .withSigner(signer)
        .withSaltGenerator(saltGenerator)
        .withDisclosureFrame({
            credentialSubject: {
                image: true,
                gender: true,
                birthDate: true,
                lprNumber: true,
                givenName: true,
                lprCategory: true,
                birthCountry: true,
                residentSince: true,
                commuterClassification: true,
                familyName: true
            }
        })

    const compact = await sdJwt.toCompact()

    console.log('Issuing: ')
    console.log('=========')
    console.log(compact)
    console.log('=========')
    console.log('Selectively disclosable claims: ')
    console.log('================================')
    console.log({
        credentialSubject: {
            image: true,
            gender: true,
            birthDate: true,
            lprNumber: true,
            givenName: true,
            lprCategory: true,
            birthCountry: true,
            residentSince: true,
            commuterClassification: true,
            familyName: true
        }
    })
    console.log('================================')

    return compact
}

const holder = async (compact: string) => {
    console.log('====== HOLDER ======')

    const sdJwt = SdJwt.fromCompact(compact).withHasher(hasherAndAlgorithm)

    console.log('Claims: ')
    console.log('========')
    console.log(await sdJwt.getPrettyClaims())
    console.log('========')
    console.log()

    const presentation = await sdJwt.present([0, 1, 6])

    console.log('Presenting: ')
    console.log('============')
    console.log(presentation)
    console.log('============')

    return presentation
}

const verifier = async (presentation: string) => {
    const sdJwt = SdJwt.fromCompact(presentation).withHasher(hasherAndAlgorithm)

    const requiredClaims = [
        '@context',
        'id',
        'type',
        'credentialSubject',
        'gender',
        'image',
        'birthCountry'
    ]

    const verificationResult = await sdJwt.verify(verifyCb, requiredClaims)

    console.log('Claims: ')
    console.log('========')
    console.log(await sdJwt.getPrettyClaims())
    console.log('========')

    console.log('Required claims: ')
    console.log('=================')

    requiredClaims.forEach((i) => console.log(`  - ${i}`))

    console.log('=================')

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
