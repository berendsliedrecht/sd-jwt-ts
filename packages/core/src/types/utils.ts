export type OrPromise<T> = T | Promise<T>

export type MakePropertyRequired<T, K extends keyof T> = T &
    Required<Pick<T, K>>
