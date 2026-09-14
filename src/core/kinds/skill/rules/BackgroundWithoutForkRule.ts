import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

export class BackgroundWithoutForkRule implements Rule {
  readonly id = 'skill/background-without-fork'
  readonly severity: Severity = 'warning'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null || !frontmatter.has('background')) {
      return []
    }
    if (frontmatter.string('context') === 'fork') {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message:
          'The "background" field only applies with "context: fork". Without it the skill runs in the main conversation and "background" is ignored.',
        range: frontmatter.range('background'),
        source: 'frontmatter',
      },
    ]
  }
}
