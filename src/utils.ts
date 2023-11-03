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

export const getValueByKeyAnyLevel = <T = unknown>(
    obj: Record<string, unknown>,
    key: string
): T | undefined => {
    // Check if the current object has the key
    if (obj && obj.hasOwnProperty(key)) {
        return obj[key] as T
    }

    // If not found in the current object, iterate over its properties
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'object') {
            const result = getValueByKeyAnyLevel(
                obj[prop] as Record<string, unknown>,
                key
            )
            if (result !== undefined) {
                return result as T
            }
        }
    }
}

export const simpleDeepEqual = (lhs: unknown, rhs: unknown): boolean => {
    if (lhs === rhs) return true

    if (typeof lhs !== 'object' || typeof rhs !== 'object') return false

    const l = { ...lhs } as Record<string, unknown>
    const r = { ...rhs } as Record<string, unknown>

    Object.keys(l).forEach((key) => l[key] === undefined && delete l[key])
    Object.keys(r).forEach((key) => r[key] === undefined && delete r[key])

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
