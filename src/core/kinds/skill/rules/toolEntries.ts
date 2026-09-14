const splitOutsideParentheses = (text: string): string[] => {
  const entries: string[] = []
  let current = ''
  let depth = 0
  for (const character of text) {
    if (character === '(') {
      depth += 1
    } else if (character === ')') {
      depth = Math.max(0, depth - 1)
    }
    if (depth === 0 && /[\s,]/.test(character)) {
      entries.push(current)
      current = ''
      continue
    }
    current += character
  }
  entries.push(current)
  return entries
}

export const toolEntries = (value: unknown): string[] => {
  const pieces = typeof value === 'string' ? splitOutsideParentheses(value) : []
  if (Array.isArray(value)) {
    pieces.push(...value.filter((entry): entry is string => typeof entry === 'string'))
  }
  return pieces.map((entry) => entry.trim()).filter((entry) => entry.length > 0)
}

export const toolBaseName = (entry: string): string => entry.replace(/\(.*$/, '')
