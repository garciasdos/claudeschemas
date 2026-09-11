import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

export class MissingDescriptionRule implements Rule {
  readonly id = 'skill/missing-description'
  readonly severity: Severity = 'warning'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const description = frontmatter.string('description')
    if (description !== null && description.trim().length > 0) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message:
          'Without a "description" Claude falls back to the first non-empty line of the body when deciding whether to use this skill. Write one that says what the skill does and when to apply it.',
        range: frontmatter.has('description')
          ? frontmatter.range('description')
          : frontmatter.range('name'),
        source: 'frontmatter',
      },
    ]
  }
}
