import { createHash } from 'node:crypto'
import { Base64url } from '../src/base64url'

export const prelude = () => {
    const oldStringify = JSON.stringify
    global.JSON.stringify = (x: unknown) =>
        oldStringify(x, null, 0).split(',').join(', ').split(':').join(': ')
}

export const c14n = (x: string) => JSON.stringify(Base64url.decodeToJson(x))

export const hasher = (i: string) =>
    createHash('sha256').update(i).digest('base64url')
