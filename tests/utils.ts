import { createHash } from 'node:crypto'

import assert from 'node:assert'
import { Disclosure, hashDisclosure } from '../src'

/**
 * This swaps the default JSON serializer to one that is, more, compatible with Python `json.dumps`.
 * This is because the default json parser adds whitespace after the `:` after a key and after every `,`.
 */
export const prelude = () => {
    const oldStringify = JSON.stringify
    global.JSON.stringify = (x: unknown) =>
        oldStringify(x, null, 0).split('",').join('", ').split('":').join('": ')
}

export const hasher = (i: string) =>
    createHash('sha256').update(i).digest('base64url')

export const testCreateDisclosureObjectAndHash = async (
    input: [string, string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => {
    const disclosure = new Disclosure(input[0], input[2], input[1])

    assert.strictEqual(disclosure.encoded, expectedDisclosure)

    const hash = await hashDisclosure(disclosure, hasher)

    assert.strictEqual(hash, expectedHash)
}

export const testCreateDisclosureArrayAndHash = async (
    input: [string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => {
    const disclosure = new Disclosure(input[0], input[1])

    assert.strictEqual(disclosure.encoded, expectedDisclosure)

    const hash = await hashDisclosure(disclosure, hasher)

    assert.strictEqual(hash, expectedHash)
}
