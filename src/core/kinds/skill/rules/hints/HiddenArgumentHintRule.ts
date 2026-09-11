import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'

export class HiddenArgumentHintRule implements Rule {
  readonly id = 'skill/argument-hint-hidden'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null || !frontmatter.has('argument-hint')) {
      return []
    }
    if (frontmatter.boolean('user-invocable') !== false) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message:
          '"argument-hint" only appears in the / menu, and "user-invocable: false" keeps this skill out of it. Drop the hint, or make the skill user-invocable if people should be able to call it directly.',
        range: frontmatter.range('argument-hint'),
        source: 'frontmatter',
      },
    ]
  }
}
