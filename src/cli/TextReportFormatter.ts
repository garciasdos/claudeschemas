import type { Diagnostic } from '../core'
import type { DocumentReport, ReportFormatter, ValidationReport } from './types'

const plural = (count: number, singular: string, plural: string): string =>
  `${String(count)} ${count === 1 ? singular : plural}`

const attribution = (diagnostic: Diagnostic): string => {
  const targets = diagnostic.portability?.targets
  if (targets === undefined || targets.length === 0) {
    return ''
  }
  return ` (affects ${targets.join(', ')})`
}

const line = (file: string, diagnostic: Diagnostic): string =>
  `${file}:${String(diagnostic.range.start.line)}:${String(diagnostic.range.start.column)}: ` +
  `${diagnostic.severity}: ${diagnostic.ruleId}: ${diagnostic.message}${attribution(diagnostic)}`

const summary = (result: DocumentReport, target: string): string => {
  const problemCount = result.problems.length + result.portability.length
  const problems = problemCount === 0 ? 'no problems' : plural(problemCount, 'problem', 'problems')
  return `${result.file}: ${problems}, ${plural(result.hints.length, 'hint', 'hints')} (${target})`
}

export class TextReportFormatter implements ReportFormatter {
  format(report: ValidationReport): readonly string[] {
    return report.results.flatMap((result) => [
      ...[...result.problems, ...result.portability, ...result.hints].map((diagnostic) =>
        line(result.file, diagnostic),
      ),
      summary(result, report.target),
    ])
  }
}
