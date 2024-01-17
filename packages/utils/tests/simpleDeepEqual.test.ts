import assert from 'node:assert'
import { describe, it } from 'node:test'

import { simpleDeepEqual } from '../src/simpleDeepEqual'

describe('simple deep equality', () => {
    it('simple object comparison', () => {
        const l = {
            a: 'b',
            c: 'd'
        }

        const r = {
            a: 'b',
            c: 'd'
        }

        assert(simpleDeepEqual(l, r))
    })

    it('simple object ignore undefined comparison (lhs has undefined)', () => {
        const l = {
            a: 'b',
            c: 'd',
            d: undefined
        }

        const r = {
            a: 'b',
            c: 'd'
        }

        assert(simpleDeepEqual(l, r))
    })

    it('simple object ignore undefined comparison (rhs has undefined)', () => {
        const l = {
            a: 'b',
            c: 'd'
        }

        const r = {
            a: 'b',
            c: 'd',
            d: undefined
        }

        assert(simpleDeepEqual(l, r))
    })

    it('simple string comparison', () => {
        const l = 'a'

        const r = 'a'

        assert(simpleDeepEqual(l, r))
    })

    it('simple number comparison', () => {
        const l = 1

        const r = 1

        assert(simpleDeepEqual(l, r))
    })
})
