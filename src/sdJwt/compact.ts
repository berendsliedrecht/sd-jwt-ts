import { KeyBinding } from '../keyBinding'
import { Disclosure } from './disclosures'
import { ExpandedJwt, jwtFromCompact } from '../jwt'

export type ExpandedSdJwt<
    H extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
> = ExpandedJwt<H, P> & {
    disclosures?: Array<Disclosure>
    keyBinding?: KeyBinding
}

export const sdJwtFromCompact = <
    H extends Record<string, unknown> = Record<string, unknown>,
    P extends Record<string, unknown> = Record<string, unknown>
>(
    compact: string
): ExpandedSdJwt<H, P> => {
    const [jwtWithoutDisclosures, ...encodedDisclosures] = compact.split('~')

    const { header, payload, signature } = jwtFromCompact<H, P>(
        jwtWithoutDisclosures
    )

    if (encodedDisclosures.length === 0) {
        return {
            header,
            payload,
            signature
        }
    }

    const hasKeyBinding = !compact.endsWith('~')

    // If the disclosure array ends with an `~` we do not have
    // a key binding and `String.split` takes it as an empty string
    // as element which we would not like to include in the disclosures.
    if (!hasKeyBinding) encodedDisclosures.pop()

    const compactKeyBinding = hasKeyBinding
        ? encodedDisclosures.pop()
        : undefined

    const keyBinding = compactKeyBinding
        ? KeyBinding.fromCompactJwt(compactKeyBinding)
        : undefined

    const disclosures = encodedDisclosures.map(Disclosure.fromString)

    return {
        header,
        payload,
        signature,
        keyBinding,
        disclosures
    }
}
