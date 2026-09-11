import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { lineRange } from '../../../../document/positions'

export class EmptyBodyRule implements Rule {
  readonly id = 'skill/empty-body'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = document.frontmatter
    if (frontmatter === null || frontmatter.parseError !== undefined) {
      return []
    }
    if (document.body.text.trim().length > 0) {
      return []
    }
    const closingLine = frontmatter.range.end.line
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message:
          'Nothing follows the frontmatter, so invoking the skill gives Claude only the description to work from. Write the instructions Claude should follow below the closing ---.',
        range: lineRange(closingLine, (document.lines[closingLine - 1] ?? '').length),
        source: 'body',
      },
    ]
  }
}
