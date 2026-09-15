import type { Severity } from '../../core'

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

export const portabilitySectionTitle = (count: number): string =>
  count === 1 ? '1 portability problem' : `${String(count)} portability problems`
