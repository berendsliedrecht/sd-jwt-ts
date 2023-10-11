import { before, describe, it } from 'node:test'
import { deepStrictEqual, doesNotThrow, throws } from 'node:assert'

import {
    ClaimKeyTypeValue,
    assertClaimInObject,
    deleteByPath
} from '../src/utils'

import { JwtError } from '../src'
import { prelude } from './utils'

const deleteByPathTestGenerator = (
    title: string,
    path: string,
    obj: Record<string, unknown>,
    expected: Record<string, unknown>
) => {
    it(title, () => {
        deleteByPath(obj, path)
        deepStrictEqual(obj, expected)
    })
}

const assertClaimInObjectTestGenerator = (
    title: string,
    obj: Record<string, unknown>,
    requiredClaims: Array<ClaimKeyTypeValue>,
    shouldThrow: boolean = true
) => {
    it(title, () => {
        shouldThrow
            ? throws(() => assertClaimInObject(obj, requiredClaims), JwtError)
            : doesNotThrow(() => assertClaimInObject(obj, requiredClaims))
    })
}

describe('utils', () => {
    before(prelude)

    describe('delete by path', () => {
        deleteByPathTestGenerator('simple path', 'a', { a: 123 }, {})

        deleteByPathTestGenerator('empty path', '', { a: 123 }, { a: 123 })

        deleteByPathTestGenerator(
            'nested path',
            'a.b',
            { a: { b: 123 } },
            { a: {} }
        )

        deleteByPathTestGenerator(
            'triple nested path',
            'a.b.c',
            { a: { b: { c: 123 } } },
            { a: { b: {} } }
        )

        deleteByPathTestGenerator(
            'nested path, delete parent',
            'a',
            { a: { b: 123 } },
            {}
        )

        deleteByPathTestGenerator(
            'triple nested path, delete parent',
            'a',
            { a: { b: { c: 123 } } },
            {}
        )

        deleteByPathTestGenerator(
            'path does not exist',
            'abc',
            { a: 123 },
            { a: 123 }
        )
    })

    describe('assert claim in object', () => {
        assertClaimInObjectTestGenerator(
            'assert claims key, type and value correctly',
            { a: 123 },
            [['a', 123]],
            false
        )

        assertClaimInObjectTestGenerator(
            'assert multiple claims key, type and value correctly',
            { a: 123, b: 'abc' },
            [
                ['a', 123],
                ['b', 'abc']
            ],
            false
        )

        assertClaimInObjectTestGenerator(
            'assert nested claims key, type and value correctly',
            { a: { b: '123' } },
            [['a', { b: '123' }]],
            false
        )

        assertClaimInObjectTestGenerator('claim not in object', {}, [['a']])

        assertClaimInObjectTestGenerator(
            'claim in object, but wrong value',
            { a: '123' },
            [['a', { some: 'other-item' }]]
        )

        assertClaimInObjectTestGenerator(
            'some claims in object, but not all',
            { a: '123' },
            [['a'], ['b']]
        )

        assertClaimInObjectTestGenerator(
            'assert claims as in keybinding is required for the header',
            { typ: 'kb+jwt', alg: 'ES256' },
            [['typ', 'kb+jwt'], ['alg']],
            false
        )

        assertClaimInObjectTestGenerator(
            'assert claims as in keybinding is required for the payloadj',
            {
                iat: new Date().getTime(),
                aud: 'https://example.org/audience',
                nonce: 'some-random-nonce'
            },
            [['iat'], ['aud'], ['nonce']],
            false
        )
    })
})
