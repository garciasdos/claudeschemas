import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'

const overclaim =
  /\b(always|every (?:request|task|message|prompt|conversation)|any (?:request|task|message|prompt)|all (?:requests|tasks|messages|prompts)|everything|for anything)\b/i
const describedFields = ['description', 'when_to_use'] as const

export class DescriptionOverclaimRule implements Rule {
  readonly id = 'skill/description-overclaims'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const diagnostics: Diagnostic[] = []
    for (const field of describedFields) {
      const text = frontmatter.string(field)
      const phrase = text === null ? undefined : overclaim.exec(text)?.[1]
      if (phrase === undefined) {
        continue
      }
      diagnostics.push({
        ruleId: this.id,
        severity: this.severity,
        message: `"${field}" says "${phrase}", which tells Claude to reach for this skill on unrelated requests too, crowding out better matches. Name the concrete situations instead, such as the file types, commands or questions it is for.`,
        range: frontmatter.range(field),
        source: 'frontmatter',
      })
    }
    return diagnostics
  }
}
