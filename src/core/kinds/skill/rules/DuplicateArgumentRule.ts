import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

export class DuplicateArgumentRule implements Rule {
  readonly id = 'skill/duplicate-argument'
  readonly severity: Severity = 'error'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const names = frontmatter.list('arguments') ?? []
    const seen = new Set<string>()
    const duplicates = new Set<string>()
    for (const name of names) {
      if (seen.has(name)) {
        duplicates.add(name)
      }
      seen.add(name)
    }
    return Array.from(duplicates).map((name) => ({
      ruleId: this.id,
      severity: this.severity,
      message: `"${name}" is declared more than once in "arguments". Each name maps to one position, so a repeated name leaves a position that "$${name}" can never reach. Give every argument its own name.`,
      range: frontmatter.range('arguments'),
      source: 'frontmatter',
    }))
  }
}
