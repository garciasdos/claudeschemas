import type { Diagnostic, Severity } from '../../core'

export type SeverityCounts = Record<Severity, number>

export const countBySeverity = (diagnostics: readonly Diagnostic[]): SeverityCounts => {
  const counts: SeverityCounts = { error: 0, warning: 0, info: 0 }
  for (const diagnostic of diagnostics) {
    counts[diagnostic.severity] += 1
  }
  return counts
}

const labels: Record<Severity, [string, string]> = {
  error: ['error', 'errors'],
  warning: ['warning', 'warnings'],
  info: ['info', 'info'],
}

export const countLabel = (severity: Severity, count: number): string =>
  `${String(count)} ${count === 1 ? labels[severity][0] : labels[severity][1]}`
