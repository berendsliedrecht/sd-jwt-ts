import { createHash } from 'node:crypto'

import assert from 'node:assert'
import { hashDisclosure } from '../src/hashDisclosure'
import {
    createArrayDisclosure,
    createObjectDisclosure,
    encodeDisclosure
} from '../src/disclosures'

/**
 * This swaps the default JSON serializer to one that is, more, compatible with Python `json.dumps`.
 * This is because the default json parser adds whitespace after the `:` after a key and after every `,`.
 */
export const prelude = () => {
    const oldStringify = JSON.stringify
    global.JSON.stringify = (x: unknown) =>
        oldStringify(x, null, 0).split(',').join(', ').split(':').join(': ')
}

export const hasher = (i: string) =>
    createHash('sha256').update(i).digest('base64url')

export const testCreateDisclosureObjectAndHash = async (
    input: [string, string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => {
    const disclosure = createObjectDisclosure(...input)

    const encodedDisclosure = encodeDisclosure(disclosure)

    assert.strictEqual(encodedDisclosure, expectedDisclosure)

    const hash = await hashDisclosure(encodedDisclosure, hasher)

    assert.strictEqual(hash, expectedHash)
}

export const testCreateDisclosureArrayAndHash = async (
    input: [string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => {
    const disclosure = createArrayDisclosure(...input)

    const encodedDisclosure = encodeDisclosure(disclosure)

    assert.strictEqual(encodedDisclosure, expectedDisclosure)

    const hash = await hashDisclosure(encodedDisclosure, hasher)

    assert.strictEqual(hash, expectedHash)
}
