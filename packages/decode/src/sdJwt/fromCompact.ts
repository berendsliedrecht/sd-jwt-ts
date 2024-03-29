import { disclosureFromString } from '../disclosures/fromString'
import { jwtFromCompact } from '../jwt'
import { keyBindingFromCompact } from '../keyBinding'

export const sdJwtFromCompact = <
    Header extends Record<string, unknown> = Record<string, unknown>,
    Payload extends Record<string, unknown> = Record<string, unknown>
>(
    compact: string
) => {
    if (!compact.includes('~')) {
        throw new Error(
            'compact is not a valid sd-jwt. It must contain at least one ~'
        )
    }
    const [jwtWithoutDisclosures, ...encodedDisclosures] = compact.split('~')

    const { header, payload, signature } = jwtFromCompact<Header, Payload>(
        jwtWithoutDisclosures
    )

    // No KB-JWT or disclosures
    if (encodedDisclosures.length === 1 && encodedDisclosures[0] === '') {
        return {
            header,
            payload,
            signature
        }
    }

    // If the disclosure array ends with an `~` we do not have
    // a key binding and `String.split` takes it as an empty string
    // as element which we would not like to include in the disclosures.
    const compactKeyBinding = encodedDisclosures.pop()
    const hasKeyBinding = compactKeyBinding && compactKeyBinding !== ''

    const keyBinding = hasKeyBinding
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
