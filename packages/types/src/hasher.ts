export type Hasher = (data: string, algorithm: string) => Uint8Array

export type AsyncHasher = (
    data: string,
    algorithm: string
) => Promise<Uint8Array>
