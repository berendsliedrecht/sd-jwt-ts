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
