import { Disclosure } from './disclosures'
import { Hasher } from '../types'

const shouldInsertDisclosure = async (
    hasher: Hasher,
    key: string,
    value: unknown,
    disclosures: Array<Disclosure>
) => {
    if (key !== '_sd') return []
    if (!Array.isArray(value)) return []

    const filteredDisclosures = []

    for (const d of disclosures) {
        const digest = await d.digest(hasher)
        if (value.includes(digest)) {
            filteredDisclosures.push(d)
        }
    }

    return filteredDisclosures
}

const shouldIncludeCleartextClaim = (key: string, value: unknown) =>
    key !== '_sd' && key !== '_sd_alg' && typeof value !== 'object'

export const swapClaims = async (
    hasher: Hasher,
    payload: Record<string, unknown>,
    disclosures: Array<Disclosure>,
    newPayload: Record<string, unknown> = {}
) => {
    const entries = Object.entries(payload)

    // Loop over de payload
    for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i]

        // See whether we have an `_sd` key with an array of disclosures.
        const foundDisclosures = await shouldInsertDisclosure(
            hasher,
            key,
            value,
            disclosures
        )

        // Add the disclosed items to the pretty payload
        foundDisclosures.forEach((d) => {
            const [, disclosureKey, disclosureValue] = d.decoded
            newPayload[disclosureKey as string] = disclosureValue
        })

        // Skip the rest as  `_sd` is a special case
        if (key === '_sd') {
            continue
        }

        // Include all the primitive claims into the new payload
        if (shouldIncludeCleartextClaim(key, value)) {
            newPayload[key] = value
            continue
        }

        if (typeof value === 'object' && Array.isArray(value)) {
            newPayload[key] = await swapClaimsInsideArray(
                hasher,
                value,
                disclosures
            )
            continue
        }

        if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        ) {
            newPayload[key] = await swapClaims(
                hasher,
                value as Record<string, unknown>,
                disclosures
            )
        }
    }

    return newPayload
}

const swapClaimsInsideArray = async (
    hasher: Hasher,
    array: Array<unknown | { '...': string }>,
    disclosures: Array<Disclosure>
) => {
    const processedArray = []

    for (const el of array) {
        if (typeof el === 'object' && el !== null && '...' in el) {
            const hash = el['...']
            let disclosureFound = false
            let disclosureValue

            for (const d of disclosures) {
                const digest = await d.digest(hasher)
                if (digest === hash && d.decoded[2] === undefined) {
                    disclosureValue = d.decoded[1]
                    disclosureFound = true
                    break
                }
            }

            if (disclosureFound) {
                processedArray.push(disclosureValue)
            } else {
                processedArray.push(el)
            }
        } else {
            processedArray.push(el)
        }
    }

    return processedArray
}
