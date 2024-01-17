import { createHash, getRandomValues } from 'node:crypto'
import { deepStrictEqual, strictEqual } from 'node:assert'
import { before, describe, it } from 'node:test'

import { prelude } from './utils'

import { createDecoys } from '../src/sdJwt'

describe('decoys', async () => {
    before(prelude)

    it('Create correct amount of decoys', async () => {
        const decoys = await createDecoys(10, () => 'salt', {
            hasher: (input) => Buffer.from(input),
            algorithm: 'sha-256'
        })

        deepStrictEqual(
            decoys,
            new Array(10).fill(Buffer.from('salt').toString('base64url'))
        )
    })

    it('Sha256 decoys have the correct length', async () => {
        const decoys = await createDecoys(
            10,
            () => getRandomValues(Buffer.alloc(128 / 8)).toString('base64url'),
            {
                hasher: (input) => createHash('sha256').update(input).digest(),
                algorithm: 'sha-256'
            }
        )

        decoys.forEach((d) => strictEqual(d.length, 43))
    })
})
