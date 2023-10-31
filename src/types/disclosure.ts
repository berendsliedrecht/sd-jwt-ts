export type DisclosureItem = [string, string, unknown] | [string, unknown]

export type DisclosureFrame<T> = T extends Array<unknown>
    ? {
          [K in keyof T]?: T[K] extends Record<string | number, unknown>
              ? DisclosureFrame<T[K]> | boolean
              : boolean
      }
    : T extends Record<string, unknown>
    ? {
          [K in keyof T]?: T[K] extends Array<unknown>
              ? DisclosureFrame<T[K]> | boolean
              : T[K] extends Record<string, unknown>
              ? ({ __decoyCount?: number } & DisclosureFrame<T[K]>) | boolean
              : boolean
      } & { __decoyCount?: number } & Record<string, unknown>
    : boolean
