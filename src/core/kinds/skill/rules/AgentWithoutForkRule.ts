import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'

export class AgentWithoutForkRule implements Rule {
  readonly id = 'skill/agent-without-fork'
  readonly severity: Severity = 'warning'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null || !frontmatter.has('agent')) {
      return []
    }
    if (frontmatter.string('context') === 'fork') {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message:
          'The "agent" field only takes effect with "context: fork". Without it the skill runs in the main conversation and the subagent type is ignored.',
        range: frontmatter.range('agent'),
        source: 'frontmatter',
      },
    ]
  }
}
