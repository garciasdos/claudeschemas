const canonical = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')

const editDistance = (left: string, right: string): number => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0] ?? 0
    previous[0] = row
    for (let column = 1; column <= right.length; column += 1) {
      const above = previous[column] ?? 0
      const substitution = diagonal + (left[row - 1] === right[column - 1] ? 0 : 1)
      previous[column] = Math.min(above + 1, (previous[column - 1] ?? 0) + 1, substitution)
      diagonal = above
    }
  }
  return previous[right.length] ?? 0
}

const closeEnough = (unknown: string, known: string): boolean =>
  Math.min(unknown.length, known.length) >= 4 && editDistance(unknown, known) <= 2

export const suggestFieldName = (unknown: string, known: readonly string[]): string | null => {
  const wanted = canonical(unknown)
  const exact = known.find((candidate) => canonical(candidate) === wanted)
  if (exact !== undefined) {
    return exact
  }
  const near = known.filter((candidate) => closeEnough(wanted, canonical(candidate)))
  return near.length === 1 ? (near[0] ?? null) : null
}
