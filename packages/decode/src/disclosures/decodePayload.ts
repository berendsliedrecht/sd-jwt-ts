import { DisclosureWithDigest } from '@sd-jwt/types'

export function decodeDisclosuresInPayload(
    payload: Record<string, unknown>,
    disclosures: Array<DisclosureWithDigest>,
    newPayload: Record<string, unknown> = {}
) {
    const entries = Object.entries(payload)

    // Loop over de payload
    for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i]

        // See whether we have an `_sd` key with an array of disclosures.
        const foundDisclosures = shouldInsertDisclosure(key, value, disclosures)

        // Add the disclosed items to the pretty payload
        foundDisclosures.forEach((d) => {
            newPayload[d.key as string] = d.value
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
            newPayload[key] = swapClaimsInsideArray(value, disclosures)
            continue
        }

        if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        ) {
            newPayload[key] = decodeDisclosuresInPayload(
                value as Record<string, unknown>,
                disclosures
            )
        }
    }

    return newPayload
}

function swapClaimsInsideArray(
    array: Array<unknown | { '...': string }>,
    disclosures: Array<DisclosureWithDigest>
) {
    const processedArray = []

    for (const el of array) {
        if (typeof el === 'object' && el !== null && '...' in el) {
            const hash = el['...']
            let disclosureFound = false
            let disclosureValue

            disclosureLoop: for (const d of disclosures) {
                if (d.digest === hash && d.key === undefined) {
                    disclosureValue = d.value
                    disclosureFound = true
                    break disclosureLoop
                }
            }

            processedArray.push(disclosureFound ? disclosureValue : el)
        } else {
            processedArray.push(el)
        }
    }

    return processedArray
}

function shouldInsertDisclosure(
    key: string,
    value: unknown,
    disclosures: Array<DisclosureWithDigest>
) {
    if (key !== '_sd') return []
    if (!Array.isArray(value)) return []

    const filteredDisclosures = []

    for (const d of disclosures) {
        if (value.includes(d.digest)) {
            filteredDisclosures.push(d)
        }
    }

    return filteredDisclosures
}

function shouldIncludeCleartextClaim(key: string, value: unknown) {
    return key !== '_sd' && key !== '_sd_alg' && typeof value !== 'object'
}
