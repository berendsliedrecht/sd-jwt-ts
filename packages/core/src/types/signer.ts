import { OrPromise } from './utils'

export type Signer<
    Header extends Record<string, unknown> = Record<string, unknown>
> = (input: string, header: Header) => OrPromise<Uint8Array>
