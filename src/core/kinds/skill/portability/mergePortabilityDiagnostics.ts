import type { Diagnostic } from '../../../diagnostics/types'

const groupKeyOf = (diagnostic: Diagnostic): string =>
  [
    diagnostic.ruleId,
    diagnostic.source,
    diagnostic.range.start.line,
    diagnostic.range.start.column,
    diagnostic.range.end.line,
    diagnostic.range.end.column,
  ].join(' ')

export const mergePortabilityDiagnostics = (diagnostics: readonly Diagnostic[]): Diagnostic[] => {
  const merged: Diagnostic[] = []
  const positionByKey = new Map<string, number>()
  const targetsByKey = new Map<string, string[]>()

  for (const diagnostic of diagnostics) {
    const attribution = diagnostic.portability
    if (attribution === undefined) {
      merged.push(diagnostic)
      continue
    }
    const key = groupKeyOf(diagnostic)
    const targets = targetsByKey.get(key)
    if (targets === undefined) {
      positionByKey.set(key, merged.length)
      targetsByKey.set(key, [...attribution.targets])
      merged.push(diagnostic)
      continue
    }
    for (const target of attribution.targets) {
      if (!targets.includes(target)) {
        targets.push(target)
      }
    }
  }

  for (const [key, position] of positionByKey) {
    const diagnostic = merged[position]
    const targets = targetsByKey.get(key)
    if (diagnostic !== undefined && targets !== undefined) {
      merged[position] = { ...diagnostic, portability: { targets } }
    }
  }

  return merged
}
