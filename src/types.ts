export type MakePropertyRequired<T, K extends keyof T> = T &
  Required<Pick<T, K>>

export type AllKeys<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: K | AllKeys<O[K]> }[keyof O]
    : never
  : never
