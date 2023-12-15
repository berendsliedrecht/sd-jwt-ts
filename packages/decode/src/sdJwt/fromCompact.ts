import { disclosureFromString } from '../disclosures/fromString'
import { jwtFromCompact } from '../jwt'
import { keyBindingFromCompact } from '../keyBinding'

export const sdJwtFromCompact = <
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
>(
    compact: string
) => {
    const [jwtWithoutDisclosures, ...encodedDisclosures] = compact.split('~')

    const { header, payload, signature } = jwtFromCompact<Header, Payload>(
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
        ? keyBindingFromCompact(compactKeyBinding)
        : undefined

    const disclosures = encodedDisclosures.map(disclosureFromString)

    return {
        header,
        payload,
        signature,
        keyBinding,
        disclosures
    }
}
