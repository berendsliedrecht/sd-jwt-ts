import { describe, it } from 'node:test'
import assert from 'node:assert'

import { createDecoys } from '../src/createDecoys'
import { createHash, getRandomValues } from 'node:crypto'

describe('createDecoys', async () => {
    it('Create correct amount of decoys', async () => {
        const decoys = await createDecoys(
            10,
            () => 'salt',
            (input) => `hash=${input}`
        )

        assert.deepStrictEqual(decoys, new Array(10).fill('hash=salt'))
    })

    it('Sha256 decoys have the correct length', async () => {
        const decoys = await createDecoys(
            10,
            () => getRandomValues(Buffer.alloc(128 / 8)).toString('base64url'),
            (input) => createHash('sha256').update(input).digest('base64url')
        )

        decoys.forEach((d) => assert.strictEqual(d.length, 43))
    })
})
