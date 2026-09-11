import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

export class UninvokableSkillRule implements Rule {
  readonly id = 'skill/uninvokable'
  readonly severity: Severity = 'error'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    if (frontmatter.boolean('disable-model-invocation') !== true) {
      return []
    }
    if (frontmatter.boolean('user-invocable') !== false) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message:
          'Nothing can invoke this skill: "disable-model-invocation: true" keeps Claude out and "user-invocable: false" hides it from the / menu. Drop one of the two.',
        range: frontmatter.range('disable-model-invocation'),
        source: 'frontmatter',
      },
    ]
  }
}
