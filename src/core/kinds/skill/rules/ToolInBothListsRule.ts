import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'
import { toolBaseName, toolEntries } from './toolEntries'

const coveredBy = (allowed: string, disallowed: string): boolean =>
  allowed === disallowed || toolBaseName(allowed) === disallowed

export class ToolInBothListsRule implements Rule {
  readonly id = 'skill/tool-in-both-lists'
  readonly severity: Severity = 'warning'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const disallowed = toolEntries(frontmatter.raw('disallowed-tools'))
    const conflicting = toolEntries(frontmatter.raw('allowed-tools')).filter((allowed) =>
      disallowed.some((entry) => coveredBy(allowed, entry)),
    )
    if (conflicting.length === 0) {
      return []
    }
    const listed = conflicting.map((entry) => `"${entry}"`).join(', ')
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `${listed} ${conflicting.length === 1 ? 'appears' : 'appear'} in both "allowed-tools" and "disallowed-tools". The disallow wins, so the grant is never used. Keep the entry in one list only.`,
        range: frontmatter.range('allowed-tools'),
        source: 'frontmatter',
      },
    ]
  }
}
