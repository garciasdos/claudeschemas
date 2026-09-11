import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'

export class DescriptionSpecLengthRule implements Rule {
  readonly id = 'skill/description-spec-length'
  readonly severity: Severity = 'hint'

  constructor(private readonly limit = 1024) {}

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const length = frontmatter.string('description')?.length ?? 0
    if (length <= this.limit) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `The description is ${length} characters long. The Agent Skills spec caps it at ${this.limit}, so tools other than Claude Code may reject or cut it. Keep the essentials here and move trigger examples into "when_to_use".`,
        range: frontmatter.range('description'),
        source: 'frontmatter',
      },
    ]
  }
}
