export function traverseNodes(object: any, path: PathNode[] = []): LeafNode[] {
    const result: LeafNode[] = []

    if (typeof object !== 'object' || object === null) {
        return [{ path: [], value: object, isLeaf: true }]
    }

    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            const currentPath = [...path, key]
            const value = object[key as keyof typeof object]

            // Value must be object / array, and have at least some values in it
            if (
                typeof value === 'object' &&
                value !== null &&
                Object.keys(value).length > 0
            ) {
                // Recursively traverse nested objects or arrays
                result.push(...traverseNodes(value, currentPath))
            } else {
                // Leaf node found
                result.push({ path: currentPath, value, isLeaf: true })
            }
        }
    }

    return result
}

type PathNode = string | number
interface LeafNode {
    path: PathNode[]
    value: any
    isLeaf: boolean
}
