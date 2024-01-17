import { BaseFrame } from '@sd-jwt/types'

export type DisclosureItem = [string, string, unknown] | [string, unknown]

export type DisclosureFrame<T> = BaseFrame<T, { __decoyCount?: number }>
