import { JwtError } from './jwt'

export const getAllKeys = (
    object: unknown,
    keys: Array<string> = []
): Array<string> => {
    if (typeof object !== 'object' || typeof object === null) return keys
    const record = object as Record<string, unknown>

    const objectKeys = Object.keys(record)
    const objectValues = Object.values(record)
    keys.push(...objectKeys)

    for (const objectValue of objectValues) {
        if (
            typeof objectValue === 'object' &&
            objectValue !== null &&
            !Array.isArray(objectValue)
        ) {
            getAllKeys(objectValue, keys)
        }
    }

    return keys
}

const simpleDeepEqual = (lhs: unknown, rhs: unknown): boolean => {
    if (lhs === rhs) return true

    if (typeof lhs !== 'object' || typeof rhs !== 'object') return false

    const l = lhs as Record<string, unknown>
    const r = rhs as Record<string, unknown>

    const keys1 = Object.keys(l)
    const keys2 = Object.keys(r)

    if (keys1.length !== keys2.length) return false

    return keys1.every((key) => simpleDeepEqual(l[key], r[key]))
}

export const deleteByPath = (object: Record<string, unknown>, path: string) => {
    let currentObject: Record<string, unknown> | undefined = object
    const parts = path.split('.')
    const last = parts.pop()
    for (const part of parts) {
        currentObject = currentObject[part] as
            | Record<string, unknown>
            | undefined

        if (!currentObject) {
            return
        }
    }
    if (last) {
        delete currentObject[last]
    }
}

export type ClaimKeyTypeValue = [string] | [string, unknown]

export const assertClaimInObject = (
    object: Record<string, unknown>,
    claim: Array<ClaimKeyTypeValue>
) => {
    const keys = Object.keys(object)

    for (const [requiredKey, requiredValue] of claim) {
        if (!keys.includes(requiredKey)) {
            throw new JwtError(
                `Object does not include a required property '${requiredKey}'`
            )
        }

        const actualValue = object[requiredKey]

        if (requiredValue && !simpleDeepEqual(actualValue, requiredValue)) {
            throw new JwtError(
                `Object includes the required property '${requiredKey}', but there is a value mistmatch. Expected: '${requiredValue}', actual: '${actualValue}'`
            )
        }
    }
}
