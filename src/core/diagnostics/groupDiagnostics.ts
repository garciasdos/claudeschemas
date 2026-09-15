import type { Diagnostic, Severity } from './types'

export type SeverityCounts = Record<Severity, number>

export interface DiagnosticGroups {
  readonly problems: readonly Diagnostic[]
  readonly portability: readonly Diagnostic[]
  readonly hints: readonly Diagnostic[]
}

export const problemSeverities: readonly Severity[] = ['error', 'warning', 'info']

export const isHint = (diagnostic: Diagnostic): boolean => diagnostic.severity === 'hint'

export const isPortabilityFinding = (diagnostic: Diagnostic): boolean =>
  diagnostic.portability !== undefined

export const groupDiagnostics = (diagnostics: readonly Diagnostic[]): DiagnosticGroups => ({
  problems: diagnostics.filter(
    (diagnostic) => !isHint(diagnostic) && !isPortabilityFinding(diagnostic),
  ),
  portability: diagnostics.filter(
    (diagnostic) => !isHint(diagnostic) && isPortabilityFinding(diagnostic),
  ),
  hints: diagnostics.filter(isHint),
})

export const problemDiagnostics = (groups: DiagnosticGroups): readonly Diagnostic[] => [
  ...groups.problems,
  ...groups.portability,
]

export const countBySeverity = (diagnostics: readonly Diagnostic[]): SeverityCounts => {
  const counts: SeverityCounts = { error: 0, warning: 0, info: 0, hint: 0 }
  for (const diagnostic of diagnostics) {
    counts[diagnostic.severity] += 1
  }
  return counts
}
