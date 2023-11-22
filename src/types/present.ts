export type PresentationFrame<T> = T extends Array<unknown>
    ? {
          [K in keyof T]?: T[K] extends Record<string | number, unknown>
              ? PresentationFrame<T[K]> | boolean
              : boolean
      }
    : T extends Record<string, unknown>
    ? {
          [K in keyof T]?: T[K] extends Array<unknown>
              ? PresentationFrame<T[K]> | boolean
              : T[K] extends Record<string, unknown>
              ? PresentationFrame<T[K]> | boolean
              : boolean
      } & Record<string, unknown>
    : boolean
