import { Base64url } from '../src/base64url'

export const c14n = (x: string) => JSON.stringify(Base64url.decodeToJson(x))
