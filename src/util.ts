// @ts-ignore
export const deleteByPath = (object, path) => {
  let currentObject = object
  const parts = path.split('.')
  const last = parts.pop()
  for (const part of parts) {
    currentObject = currentObject[part]
    if (!currentObject) {
      return
    }
  }
  delete currentObject[last]
}
