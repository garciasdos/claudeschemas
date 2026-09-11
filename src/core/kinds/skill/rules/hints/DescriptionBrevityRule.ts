import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'

export class DescriptionBrevityRule implements Rule {
  readonly id = 'skill/description-brevity'
  readonly severity: Severity = 'hint'

  constructor(private readonly minimumWords = 5) {}

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const description = frontmatter.string('description')?.trim() ?? ''
    if (description.length === 0) {
      return []
    }
    const words = description.split(/\s+/).length
    if (words >= this.minimumWords) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `The description is ${words} ${words === 1 ? 'word' : 'words'} long. Claude matches requests against this text, so a stub like "${description}" rarely triggers. Say what the skill produces and what kind of request it serves.`,
        range: frontmatter.range('description'),
        source: 'frontmatter',
      },
    ]
  }
}
