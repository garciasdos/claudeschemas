import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { lineRange } from '../../../document/positions'

export class MissingFrontmatterRule implements Rule {
  readonly id = 'skill/no-frontmatter'
  readonly severity: Severity = 'info'

  check(document: ParsedDocument): Diagnostic[] {
    if (document.frontmatter !== null) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message:
          'This file has no frontmatter, so the whole file is treated as the skill instructions, the name comes from the directory and Claude uses the first non-empty line as the description. Open the file with --- on its own first line to add frontmatter.',
        range: lineRange(1, (document.lines[0] ?? '').length),
        source: 'body',
      },
    ]
  }
}
