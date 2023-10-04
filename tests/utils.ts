import { createHash } from 'node:crypto'
import { Base64url } from '../src/base64url'

import assert from 'node:assert'
import { hashDisclosure } from '../src/hashDisclosure'
import {
    createArrayDisclosure,
    createObjectDisclosure,
} from '../src/createDisclosure'

export const prelude = () => {
    const oldStringify = JSON.stringify
    global.JSON.stringify = (x: unknown) =>
        oldStringify(x, null, 0).split(',').join(', ').split(':').join(': ')
}

export const c14n = (x: string) => JSON.stringify(Base64url.decodeToJson(x))

export const hasher = (i: string) =>
    createHash('sha256').update(i).digest('base64url')

export const testCreateDisclosureObjectAndHash = async (
    input: [string, string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => {
    const disclosure = createObjectDisclosure(...input)

    assert.strictEqual(disclosure, expectedDisclosure)

    const hash = await hashDisclosure(disclosure, hasher)

    assert.strictEqual(hash, expectedHash)
}

export const testCreateDisclosureArrayAndHash = async (
    input: [string, unknown],
    expectedDisclosure: string,
    expectedHash: string
) => {
    const disclosure = createArrayDisclosure(...input)

    assert.strictEqual(disclosure, expectedDisclosure)

    const hash = await hashDisclosure(disclosure, hasher)

    assert.strictEqual(hash, expectedHash)
}
