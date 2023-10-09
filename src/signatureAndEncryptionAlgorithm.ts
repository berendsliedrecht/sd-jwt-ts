/**
 * Enumeration representing various JSON Web Token (JWT) algorithms for digital signatures and encryption.
 */
export enum SignatureAndEncryptionAlgorithm {
    /**
     * RSASSA-PKCS1-v1_5 using SHA-256
     */
    RS256 = 'RS256',

    /**
     * RSASSA-PKCS1-v1_5 using SHA-384
     */
    RS384 = 'RS384',

    /**
     * RSASSA-PKCS1-v1_5 using SHA-512
     */
    RS512 = 'RS512',

    /**
     * ECDSA using P-256 and SHA-256
     */
    ES256 = 'ES256',

    /**
     * ECDSA using P-384 and SHA-384
     */
    ES384 = 'ES384',

    /**
     * ECDSA using P-521 and SHA-512
     */
    ES512 = 'ES512',

    /**
     * RSA-PSS using SHA-256
     */
    PS256 = 'PS256',

    /**
     * RSA-PSS using SHA-384
     */
    PS384 = 'PS384',

    /**
     * RSA-PSS using SHA-512
     */
    PS512 = 'PS512',

    /**
     * No digital signature or MAC performed
     */
    none = 'none',

    /**
     * RSAES-PKCS1-v1_5
     */
    RSA1_5 = 'RSA1_5',

    /**
     * RSAES OAEP
     */
    RSA_OAEP = 'RSA-OAEP',

    /**
     * RSAES OAEP using SHA-256
     */
    RSA_OAEP_256 = 'RSA-OAEP-256',

    /**
     * AES Key Wrap using 128-bit key
     */
    A128KW = 'A128KW',

    /**
     * AES Key Wrap using 192-bit key
     */
    A192KW = 'A192KW',

    /**
     * AES Key Wrap using 256-bit key
     */
    A256KW = 'A256KW',

    /**
     * Direct use of a shared symmetric key
     */
    dir = 'dir',

    /**
     * ECDH-ES using Concat KDF
     */
    ECDH_ES = 'ECDH-ES',

    /**
     * ECDH-ES using Concat KDF and "A128KW" wrapping
     */
    ECDH_ES_A128KW = 'ECDH-ES+A128KW',

    /**
     * ECDH-ES using Concat KDF and "A192KW" wrapping
     */
    ECDH_ES_A192KW = 'ECDH-ES+A192KW',

    /**
     * ECDH-ES using Concat KDF and "A256KW" wrapping
     */
    ECDH_ES_A256KW = 'ECDH-ES+A256KW',

    /**
     * Key wrapping with AES GCM using 128-bit key
     */
    A128GCMKW = 'A128GCMKW',

    /**
     * Key wrapping with AES GCM using 192-bit key
     */
    A192GCMKW = 'A192GCMKW',

    /**
     * Key wrapping with AES GCM using 256-bit key
     */
    A256GCMKW = 'A256GCMKW'
}
