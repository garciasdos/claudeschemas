import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'

const firstPerson = /\b(I|I'll|I'm|I've|I'd|[Ww]e|[Ww]e'll|[Ww]e're|[Ww]e've|[Oo]ur|[Uu]s)\b/
const secondPerson =
  /\b(you can|you'll|you're|you may|you want|help(?:s|ing)? you|let(?:s|ting)? you|allow(?:s|ing)? you|for you)\b/i

const describedFields = ['description', 'when_to_use'] as const

export class DescriptionVoiceRule implements Rule {
  readonly id = 'skill/description-voice'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const diagnostics: Diagnostic[] = []
    for (const field of describedFields) {
      const text = frontmatter.string(field)
      if (text === null) {
        continue
      }
      const phrase = firstPerson.exec(text)?.[1] ?? secondPerson.exec(text)?.[1]
      if (phrase === undefined) {
        continue
      }
      diagnostics.push({
        ruleId: this.id,
        severity: this.severity,
        message: `"${field}" speaks as "${phrase}". Claude reads it as a catalogue entry, so describe the skill in the third person: "Processes Excel files and ..." rather than "I can help you process ..." or "You can use this to ...".`,
        range: frontmatter.range(field),
        source: 'frontmatter',
      })
    }
    return diagnostics
  }
}
