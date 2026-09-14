import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

const argumentNamePattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

const suggestedName = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export class ArgumentNameFormatRule implements Rule {
  readonly id = 'skill/argument-name-format'
  readonly severity: Severity = 'warning'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const names = frontmatter.list('arguments') ?? []
    return names
      .filter((name) => !argumentNamePattern.test(name))
      .map((name) => ({
        ruleId: this.id,
        severity: this.severity,
        message: `"${name}" is an unusual argument name. Placeholders are written as "$name" in the body, so use lowercase letters, digits and single hyphens, such as "${suggestedName(name) || 'value'}", to keep "$${name}" unambiguous next to shell variables and other text.`,
        range: frontmatter.range('arguments'),
        source: 'frontmatter',
      }))
  }
}
