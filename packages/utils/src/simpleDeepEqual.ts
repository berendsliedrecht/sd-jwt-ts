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
