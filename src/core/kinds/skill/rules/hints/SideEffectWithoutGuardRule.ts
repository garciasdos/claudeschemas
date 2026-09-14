import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'

const sideEffectVerb =
  /\b(deploy|deploys|deploying|publish|publishes|publishing|push|pushes|pushing|send|sends|sending|email|emails|emailing)\b/i

export class SideEffectWithoutGuardRule implements Rule {
  readonly id = 'skill/side-effect-without-guard'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null || frontmatter.boolean('disable-model-invocation') === true) {
      return []
    }
    for (const field of ['name', 'description'] as const) {
      const text = frontmatter.string(field)
      const verb = text === null ? undefined : sideEffectVerb.exec(text.replace(/-/g, ' '))?.[1]
      if (verb === undefined) {
        continue
      }
      return [
        {
          ruleId: this.id,
          severity: this.severity,
          message: `The ${field} says the skill will "${verb}", which sounds like a side effect, yet Claude may invoke it on its own whenever a request seems to fit. Add "disable-model-invocation: true" so only a person can run it, or reword if nothing leaves the machine.`,
          range: frontmatter.range(field),
          source: 'frontmatter',
        },
      ]
    }
    return []
  }
}
