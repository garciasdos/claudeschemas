import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

const explanations: Record<string, string> = {
  when_to_use:
    '"when_to_use" is only read when Claude decides on its own whether to invoke a skill. With "disable-model-invocation: true" the description is never loaded, so nothing reads this field. Remove it, or drop "disable-model-invocation" if Claude should be able to pick the skill.',
  paths:
    '"paths" only limits automatic activation, and "disable-model-invocation: true" already rules that out, so this field does nothing. Remove it, or drop "disable-model-invocation" if Claude should activate the skill on matching files.',
}

export class DeadModelInvocationFieldRule implements Rule {
  readonly id = 'skill/dead-model-invocation-field'
  readonly severity: Severity = 'warning'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null || frontmatter.boolean('disable-model-invocation') !== true) {
      return []
    }
    return Object.entries(explanations)
      .filter(([field]) => frontmatter.has(field))
      .map(([field, message]) => ({
        ruleId: this.id,
        severity: this.severity,
        message,
        range: frontmatter.range(field),
        source: 'frontmatter',
      }))
  }
}
