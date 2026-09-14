import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { findInBody } from '../bodyMatches'

const absolutePath =
  /(?<![\w/\\:.-])(?:\/Users\/[^\s"'`)\]>]+|\/home\/[^\s"'`)\]>]+|[A-Za-z]:\\[^\s"'`)\]>]+)/g

export class AbsolutePathRule implements Rule {
  readonly id = 'skill/absolute-path'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    return findInBody(document, absolutePath).map((match) => ({
      ruleId: this.id,
      severity: this.severity,
      message: `"${match.value[0]}" is an absolute path on one machine, so the skill breaks for anyone else. Refer to files bundled with the skill through \${CLAUDE_SKILL_DIR}, and to project files by a path relative to the project root.`,
      range: match.range,
      source: 'body',
    }))
  }
}
