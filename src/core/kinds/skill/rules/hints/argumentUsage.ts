import type { ParsedDocument } from '../../../../document/types'
import { findUnescapedInBody } from '../bodyMatches'

export const positionalPlaceholder = /\$(?:ARGUMENTS(?:\[\d+\])?|\d+)\b/g

const namedPlaceholder = /\$([a-z][a-z0-9-]*)\b/g

export const referencesArguments = (
  document: ParsedDocument,
  names: readonly string[],
): boolean => {
  if (findUnescapedInBody(document, positionalPlaceholder).length > 0) {
    return true
  }
  const declared = new Set(names)
  return findUnescapedInBody(document, namedPlaceholder).some((match) =>
    declared.has(match.value[1] ?? ''),
  )
}
