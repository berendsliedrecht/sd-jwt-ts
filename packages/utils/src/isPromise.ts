export const isPromise = <T>(value: Promise<T> | T): value is Promise<T> =>
    value instanceof Promise ||
    (value &&
        typeof value === 'object' &&
        value !== null &&
        'then' in value &&
        value.then === 'function')
