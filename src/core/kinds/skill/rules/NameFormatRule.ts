import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

const namePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/

export class NameFormatRule implements Rule {
  readonly id = 'skill/name-format'
  readonly severity: Severity = 'error'

  constructor(private readonly maxLength = 64) {}

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const name = frontmatter.string('name')
    if (name === null) {
      return []
    }
    const diagnostics: Diagnostic[] = []
    if (!namePattern.test(name)) {
      diagnostics.push(
        this.report(
          `"${name}" is not a valid skill name. Use lowercase letters and digits separated by single hyphens, such as "review-pull-request".`,
          frontmatter,
        ),
      )
    }
    if (name.length > this.maxLength) {
      diagnostics.push(
        this.report(
          `The skill name is ${name.length} characters long. Keep it to ${this.maxLength} characters or fewer.`,
          frontmatter,
        ),
      )
    }
    return diagnostics
  }

  private report(message: string, frontmatter: SkillFrontmatter): Diagnostic {
    return {
      ruleId: this.id,
      severity: this.severity,
      message,
      range: frontmatter.range('name'),
      source: 'frontmatter',
    }
  }
}
