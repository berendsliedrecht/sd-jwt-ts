'use strict'
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              var desc = Object.getOwnPropertyDescriptor(m, k)
              if (
                  !desc ||
                  ('get' in desc
                      ? !m.__esModule
                      : desc.writable || desc.configurable)
              ) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k]
                      }
                  }
              }
              Object.defineProperty(o, k2, desc)
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              o[k2] = m[k]
          })
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, 'default', {
                  enumerable: true,
                  value: v
              })
          }
        : function (o, v) {
              o['default'] = v
          })
var __importStar =
    (this && this.__importStar) ||
    function (mod) {
        if (mod && mod.__esModule) return mod
        var result = {}
        if (mod != null)
            for (var k in mod)
                if (
                    k !== 'default' &&
                    Object.prototype.hasOwnProperty.call(mod, k)
                )
                    __createBinding(result, mod, k)
        __setModuleDefault(result, mod)
        return result
    }
Object.defineProperty(exports, '__esModule', { value: true })
const node_test_1 = require('node:test')
const node_assert_1 = __importStar(require('node:assert'))
const utils_1 = require('../src/utils')
const utils_2 = require('./utils')
const deleteByPathTestGenerator = (title, path, obj, expected) => {
    ;(0, node_test_1.it)(title, () => {
        ;(0, utils_1.deleteByPath)(obj, path)
        ;(0, node_assert_1.deepStrictEqual)(obj, expected)
    })
}
;(0, node_test_1.describe)('utils', () => {
    ;(0, node_test_1.before)(utils_2.prelude)
    ;(0, node_test_1.describe)('delete by path', () => {
        deleteByPathTestGenerator('simple path', ['a'], { a: 123 }, {})
        deleteByPathTestGenerator('empty path', [], { a: 123 }, { a: 123 })
        deleteByPathTestGenerator(
            'nested path',
            ['a', 'b'],
            { a: { b: 123 } },
            { a: {} }
        )
        deleteByPathTestGenerator(
            'triple nested path',
            ['a', 'b', 'c'],
            { a: { b: { c: 123 } } },
            { a: { b: {} } }
        )
        deleteByPathTestGenerator(
            'nested path, delete parent',
            ['a'],
            { a: { b: 123 } },
            {}
        )
        deleteByPathTestGenerator(
            'triple nested path, delete parent',
            ['a'],
            { a: { b: { c: 123 } } },
            {}
        )
        deleteByPathTestGenerator(
            'path does not exist',
            ['abc'],
            { a: 123 },
            { a: 123 }
        )
    })
    ;(0, node_test_1.describe)('simple deep equality', () => {
        ;(0, node_test_1.it)('simple object comparison', () => {
            const l = {
                a: 'b',
                c: 'd'
            }
            const r = {
                a: 'b',
                c: 'd'
            }
            ;(0, node_assert_1.default)((0, utils_1.simpleDeepEqual)(l, r))
        })
        ;(0, node_test_1.it)(
            'simple object ignore undefined comparison (lhs has undefined)',
            () => {
                const l = {
                    a: 'b',
                    c: 'd',
                    d: undefined
                }
                const r = {
                    a: 'b',
                    c: 'd'
                }
                ;(0, node_assert_1.default)((0, utils_1.simpleDeepEqual)(l, r))
            }
        )
        ;(0, node_test_1.it)(
            'simple object ignore undefined comparison (rhs has undefined)',
            () => {
                const l = {
                    a: 'b',
                    c: 'd'
                }
                const r = {
                    a: 'b',
                    c: 'd',
                    d: undefined
                }
                ;(0, node_assert_1.default)((0, utils_1.simpleDeepEqual)(l, r))
            }
        )
        ;(0, node_test_1.it)('simple string comparison', () => {
            const l = 'a'
            const r = 'a'
            ;(0, node_assert_1.default)((0, utils_1.simpleDeepEqual)(l, r))
        })
        ;(0, node_test_1.it)('simple number comparison', () => {
            const l = 1
            const r = 1
            ;(0, node_assert_1.default)((0, utils_1.simpleDeepEqual)(l, r))
        })
    })
    ;(0, node_test_1.describe)('get all keys', () => {
        ;(0, node_test_1.it)('get all non-nested keys', () => {
            const obj = {
                a: 'b',
                c: ['a', 'b']
            }
            const keys = (0, utils_1.getAllKeys)(obj)
            ;(0, node_assert_1.deepStrictEqual)(keys, ['a', 'c'])
        })
        ;(0, node_test_1.it)('get all nested keys', () => {
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
            const keys = (0, utils_1.getAllKeys)(obj)
            ;(0, node_assert_1.deepStrictEqual)(keys, [
                'a',
                'c',
                'd',
                'q',
                'p',
                'z',
                'test'
            ])
        })
        ;(0, node_test_1.it)('get all nested keys', () => {
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
            const keys = (0, utils_1.getAllKeys)(obj)
            ;(0, node_assert_1.deepStrictEqual)(keys, [
                'a',
                'c',
                'd',
                'q',
                'p',
                'z',
                'test'
            ])
        })
    })
})
//# sourceMappingURL=utils.test.js.map
