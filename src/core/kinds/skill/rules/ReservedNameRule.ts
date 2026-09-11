import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

const reservedNames = new Set(['synced'])

export class ReservedNameRule implements Rule {
  readonly id = 'skill/reserved-name'
  readonly severity: Severity = 'error'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const name = frontmatter.string('name')
    if (name === null || !reservedNames.has(name.toLowerCase())) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `"${name}" is reserved. Claude Code keeps "synced", in any capitalization, for skills downloaded from claude.ai and skips a skill you author under that name.`,
        range: frontmatter.range('name'),
        source: 'frontmatter',
      },
    ]
  }
}
