import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

export class DescriptionLengthRule implements Rule {
  readonly id = 'skill/description-length'
  readonly severity: Severity = 'error'

  constructor(private readonly limit = 1536) {}

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const description = frontmatter.string('description') ?? ''
    const whenToUse = frontmatter.string('when_to_use') ?? ''
    const combined = description.length + whenToUse.length
    if (combined <= this.limit) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `"description" and "when_to_use" are ${combined} characters together. The skill listing truncates them at ${this.limit}, so anything past that is never shown to Claude.`,
        range: frontmatter.range(description.length > 0 ? 'description' : 'when_to_use'),
        source: 'frontmatter',
      },
    ]
  }
}
