import { createHash, getRandomValues } from 'node:crypto'
import { deepStrictEqual, strictEqual } from 'node:assert'
import { before, describe, it } from 'node:test'

import { prelude } from './utils'

import { createDecoys } from '../src'

describe('decoys', async () => {
    before(prelude)

    it('Create correct amount of decoys', async () => {
        const decoys = await createDecoys(
            10,
            () => 'salt',
            (input) => `hash=${input}`
        )

        deepStrictEqual(decoys, new Array(10).fill('hash=salt'))
    })

    it('Sha256 decoys have the correct length', async () => {
        const decoys = await createDecoys(
            10,
            () => getRandomValues(Buffer.alloc(128 / 8)).toString('base64url'),
            (input) => createHash('sha256').update(input).digest('base64url')
        )

        decoys.forEach((d) => strictEqual(d.length, 43))
    })
})
