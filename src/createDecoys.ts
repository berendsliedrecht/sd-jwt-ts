import { Hasher } from './sdJwt'
import { OrPromise } from './types'

/**
 * Key should not be used to generate the salt as it needs to be unique. It is used for testing here
 */
export type SaltGenerator = () => OrPromise<string>

const createDecoy = async (saltGenerator: SaltGenerator, hasher: Hasher) => {
    const salt = await saltGenerator()
    const decoy = await hasher(salt)

    return decoy
}

export const createDecoys = async (
    count: number,
    saltGenerator: SaltGenerator,
    hasher: Hasher,
) => {
    const decoys: Array<string> = []
    for (let i = 0; i < count; i++) {
        const decoy = await createDecoy(saltGenerator, hasher)
        decoys.push(decoy)
    }
    return decoys
}
