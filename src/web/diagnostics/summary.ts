import type { Diagnostic, Severity } from '../../core'

export type SeverityCounts = Record<Severity, number>

export interface DiagnosticGroups {
  readonly problems: readonly Diagnostic[]
  readonly hints: readonly Diagnostic[]
}

export const problemSeverities: readonly Severity[] = ['error', 'warning', 'info']

export const isHint = (diagnostic: Diagnostic): boolean => diagnostic.severity === 'hint'

export const groupDiagnostics = (diagnostics: readonly Diagnostic[]): DiagnosticGroups => ({
  problems: diagnostics.filter((diagnostic) => !isHint(diagnostic)),
  hints: diagnostics.filter(isHint),
})

export const countBySeverity = (diagnostics: readonly Diagnostic[]): SeverityCounts => {
  const counts: SeverityCounts = { error: 0, warning: 0, info: 0, hint: 0 }
  for (const diagnostic of diagnostics) {
    counts[diagnostic.severity] += 1
  }
  return counts
}

const labels: Record<Severity, [string, string]> = {
  error: ['error', 'errors'],
  warning: ['warning', 'warnings'],
  info: ['info', 'info'],
  hint: ['hint', 'hints'],
}

export const countLabel = (severity: Severity, count: number): string =>
  `${String(count)} ${count === 1 ? labels[severity][0] : labels[severity][1]}`

export const hintSectionTitle = (count: number): string =>
  count === 1 ? '1 improvement hint' : `${String(count)} improvement hints`
