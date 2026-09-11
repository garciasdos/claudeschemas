import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'

const fillerOpener =
  /^\s*(this skill|the skill|a skill (?:that|to|for|which)|skill (?:that|to|for)|this is an?|this (?:will|helps|lets|allows)|an? (?:tool|helper|command|utility|workflow) (?:that|to|for|which))\b/i

export class DescriptionOpenerRule implements Rule {
  readonly id = 'skill/description-opener'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const description = frontmatter.string('description')
    if (description === null) {
      return []
    }
    const opener = fillerOpener.exec(description)?.[1]
    if (opener === undefined) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `The description opens with "${opener}", which every entry in the skill listing could say. Lead with what the skill does, using a verb such as "Formats", "Reviews" or "Generates".`,
        range: frontmatter.range('description'),
        source: 'frontmatter',
      },
    ]
  }
}
