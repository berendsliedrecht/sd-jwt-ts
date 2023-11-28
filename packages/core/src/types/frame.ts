export type BaseFrame<Payload, ExtraProperties> = Payload extends Array<unknown>
    ? {
          [K in keyof Payload]?: Payload[K] extends Record<
              string | number,
              unknown
          >
              ? BaseFrame<Payload[K], ExtraProperties> | boolean
              : boolean
      }
    : Payload extends Record<string, unknown>
      ? {
            [K in keyof Payload]?: Payload[K] extends Array<unknown>
                ? BaseFrame<Payload[K], ExtraProperties> | boolean
                : Payload[K] extends Record<string, unknown>
                  ?
                        | (ExtraProperties &
                              BaseFrame<Payload[K], ExtraProperties>)
                        | boolean
                  : boolean
        } & ExtraProperties &
            Record<string, unknown>
      : boolean
