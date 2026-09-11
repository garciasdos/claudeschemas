import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { lineRange } from '../../../document/positions'
import { countBodyLines } from './bodyMatches'

export class BodyLineCountRule implements Rule {
  readonly id = 'skill/body-line-count'
  readonly severity: Severity = 'warning'

  constructor(private readonly limit = 500) {}

  check(document: ParsedDocument): Diagnostic[] {
    const lines = countBodyLines(document)
    if (lines <= this.limit) {
      return []
    }
    const line = Math.min(document.body.range.start.line + this.limit, document.lines.length)
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `The skill body is ${lines} lines long. Keep SKILL.md under ${this.limit} lines and move detailed reference material into separate files.`,
        range: lineRange(line, (document.lines[line - 1] ?? '').length),
        source: 'body',
      },
    ]
  }
}
