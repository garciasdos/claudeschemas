import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'

const triggerPhrasing =
  /\b(when|whenever|if|use for|trigger(?:s|ed)?|ask(?:s|ed)?|mention(?:s|ed)?)\b/i

export class DescriptionTriggerRule implements Rule {
  readonly id = 'skill/description-when-to-use'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const description = frontmatter.string('description')?.trim() ?? ''
    if (description.length === 0 || triggerPhrasing.test(description)) {
      return []
    }
    if ((frontmatter.string('when_to_use')?.trim() ?? '').length > 0) {
      return []
    }
    if (frontmatter.boolean('disable-model-invocation') === true) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message:
          'The description says what the skill does but not when to reach for it. Claude picks skills from this text, so add the situations that should trigger it, such as "Use when the user asks to ...", or put them in "when_to_use".',
        range: frontmatter.range('description'),
        source: 'frontmatter',
      },
    ]
  }
}
