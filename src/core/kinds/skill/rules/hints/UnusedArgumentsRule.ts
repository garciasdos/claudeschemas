import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'
import { referencesArguments } from './argumentUsage'

export class UnusedArgumentsRule implements Rule {
  readonly id = 'skill/unused-arguments'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const names = frontmatter.list('arguments') ?? []
    const first = names[0]
    if (first === undefined || referencesArguments(document, names)) {
      return []
    }
    const listed = names.map((name) => `"${name}"`).join(', ')
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `"arguments" declares ${listed} but the body never uses them, so whatever is passed on invocation is appended after the instructions instead of landing where it is needed. Reference each one where it belongs, for example "$${first}".`,
        range: frontmatter.range('arguments'),
        source: 'frontmatter',
      },
    ]
  }
}
