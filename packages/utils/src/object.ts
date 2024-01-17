export function isObject(input: any): boolean {
    return typeof input === 'object' && input !== null && !Array.isArray(input)
}

export function getAllKeys(
    object: unknown,
    keys: Array<string> = []
): Array<string> {
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

export function deleteByPath(object: Record<string, unknown>, path: string[]) {
    let currentObject: Record<string, unknown> | undefined = object
    const parts = [...path]
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

export function getByPath(
    item: any[] | Record<string, unknown>,
    path: Array<string | number>
): unknown {
    let current: any = item
    for (const key of path) {
        if (Array.isArray(current)) {
            const keyAsNumber = Number(key)
            if (isNaN(keyAsNumber)) {
                throw new Error(
                    `Unable to get ${path.join(
                        '.'
                    )} from array ${item}. ${key} is not a number.`
                )
            }
            if (keyAsNumber >= current.length) {
                throw new Error(
                    `Unable to get ${path.join(
                        '.'
                    )} from array ${item}. ${key} is out of bounds.`
                )
            }
            current = current[keyAsNumber]
        } else if (typeof current === 'object' && current !== null) {
            if (!(key in current)) {
                throw new Error(
                    `Unable to get ${path.join(
                        '.'
                    )} from ${item}. ${key} does not exists in ${current}.`
                )
            }
            current = current[key]
        } else {
            throw new Error(
                `Unable to get ${path.join(
                    '.'
                )} from ${item}. ${key} is not an object or array.`
            )
        }
    }
    return current
}

export function hasByPath(
    item: any[] | Record<string, unknown>,
    path: Array<string | number>
): boolean {
    try {
        getByPath(item, path)
        return true
    } catch {
        return false
    }
}
