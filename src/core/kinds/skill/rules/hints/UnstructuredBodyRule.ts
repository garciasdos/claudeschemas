import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { lineRange } from '../../../../document/positions'
import { bodyLines, countBodyLines } from '../bodyMatches'

const headingLine = /^#{1,6}[ \t]+\S/

export class UnstructuredBodyRule implements Rule {
  readonly id = 'skill/body-structure'
  readonly severity: Severity = 'hint'

  constructor(private readonly minimumLines = 40) {}

  check(document: ParsedDocument): Diagnostic[] {
    const lines = countBodyLines(document)
    const content = bodyLines(document)
    if (lines < this.minimumLines || content.some((line) => headingLine.test(line))) {
      return []
    }
    const firstContentIndex = Math.max(
      content.findIndex((line) => line.trim().length > 0),
      0,
    )
    const firstLine = document.body.range.start.line + firstContentIndex
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `The body runs ${lines} lines without a single heading. Split it into sections such as "Steps", "Constraints" and "Examples" so Claude can find the relevant part, and so a long section can move into its own file later.`,
        range: lineRange(firstLine, (document.lines[firstLine - 1] ?? '').length),
        source: 'body',
      },
    ]
  }
}
