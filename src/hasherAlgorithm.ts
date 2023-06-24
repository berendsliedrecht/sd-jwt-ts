export enum HasherAlgorithm {
  /**
   * Sha-256: 256 bits. [RFC6920] (current)
   */
  Sha256 = "sha-256",
  /**
   * Sha-256-128: 128 bits. [RFC6920] (current)
   */
  Sha256_128 = "sha-256-128",
  /**
   * Sha-256-120: 120 bits. [RFC6920] (current)
   */
  Sha256_120 = "sha-256-120",
  /**
   * Sha-256-96: 96 bits. [RFC6920] (current)
   */
  Sha256_96 = "sha-256-96",
  /**
   * Sha-256-64: 64 bits. [RFC6920] (current)
   */
  Sha256_64 = "sha-256-64",
  /**
   * Sha-256-32: 32 bits. [RFC6920] (current)
   */
  Sha256_32 = "sha-256-32",
  /**
   * Sha-384: 384 bits. [FIPS 180-4] (current)
   */
  Sha384 = "sha-384",
  /**
   * Sha-512: 512 bits. [FIPS 180-4] (current)
   */
  Sha512 = "sha-512",
  /**
   * Sha3-224: 224 bits. [FIPS 202] (current)
   */
  Sha3_224 = "sha3-224",
  /**
   * Sha3-256: 256 bits. [FIPS 202] (current)
   */
  Sha3_256 = "sha3-256",
  /**
   * Sha3-384: 384 bits. [FIPS 202] (current)
   */
  Sha3_384 = "sha3-384",
  /**
   * Sha3-512: 512 bits. [FIPS 202] (current)
   */
  Sha3_512 = "sha3-512",
  /**
   * Blake2s-256: 256 bits. [RFC7693] (current)
   */
  Blake2s_256 = "blake2s-256",
  /**
   * Blake2b-256: 256 bits. [RFC7693] (current)
   */
  Blake2b_256 = "blake2b-256",
  /**
   * Blake2b-512: 512 bits. [RFC7693] (current)
   */
  Blake2b_512 = "blake2b-512",
  /**
   * K12-256: 256 bits. [draft-irtf-cfrg-kangarootwelve-06] (current)
   */
  K12_256 = "k12-256",
  /**
   * K12-512: 512 bits. [draft-irtf-cfrg-kangarootwelve-06] (current)
   */
  K12_512 = "k12-512"
}
