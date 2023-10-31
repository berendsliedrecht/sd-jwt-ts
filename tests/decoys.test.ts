import { createHash, getRandomValues } from 'node:crypto'
import { deepStrictEqual, strictEqual } from 'node:assert'
import { before, describe, it } from 'node:test'

import { prelude } from './utils'

import { createDecoys } from '../src/sdJwt'

describe('decoys', async () => {
    before(prelude)

    it('Create correct amount of decoys', async () => {
        const decoys = await createDecoys(
            10,
            () => 'salt',
            (input) => Uint8Array.from(Buffer.from(input))
        )

        deepStrictEqual(
            decoys,
            new Array(10).fill(Buffer.from('salt').toString('base64url'))
        )
    })

    it('Sha256 decoys have the correct length', async () => {
        const decoys = await createDecoys(
            10,
            () => getRandomValues(Buffer.alloc(128 / 8)).toString('base64url'),
            (input) => createHash('sha256').update(input).digest()
        )

        decoys.forEach((d) => strictEqual(d.length, 43))
    })
})
