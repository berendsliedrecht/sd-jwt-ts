import { before, describe, it } from 'node:test'
import { deepStrictEqual } from 'node:assert'

import { deleteByPath, getAllKeys } from '../src/utils'

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

    describe('get all keys', () => {
        it('get all non-nested keys', () => {
            const obj = {
                a: 'b',
                c: ['a', 'b']
            }

            const keys = getAllKeys(obj)

            deepStrictEqual(keys, ['a', 'c'])
        })

        it('get all nested keys', () => {
            const obj = {
                a: 'b',
                c: ['a', 'b'],
                d: {
                    q: 'e',
                    p: 'zz',
                    z: {
                        test: 'abba'
                    }
                }
            }

            const keys = getAllKeys(obj)

            deepStrictEqual(keys, ['a', 'c', 'd', 'q', 'p', 'z', 'test'])
        })

        it('get all nested keys', () => {
            const obj = {
                a: 'b',
                c: ['a', 'b'],
                d: {
                    q: 'e',
                    p: 'zz',
                    z: {
                        test: 'abba'
                    }
                }
            }

            const keys = getAllKeys(obj)

            deepStrictEqual(keys, ['a', 'c', 'd', 'q', 'p', 'z', 'test'])
        })
    })
})
