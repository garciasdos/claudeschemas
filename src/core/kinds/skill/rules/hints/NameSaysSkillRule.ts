import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'

const isSkillWord = (segment: string): boolean => /^skills?$/i.test(segment)

export class NameSaysSkillRule implements Rule {
  readonly id = 'skill/name-says-skill'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const name = frontmatter.string('name')
    if (name === null) {
      return []
    }
    const segments = name.split('-')
    if (!segments.some(isSkillWord)) {
      return []
    }
    const remainder = segments.filter((segment) => !isSkillWord(segment)).join('-')
    const advice =
      remainder.length > 0
        ? `Drop it so the / menu shows "/${remainder}" instead of "/${name}".`
        : 'Name the skill after what it does instead.'
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `"${name}" contains the word "skill", which every entry in the skill listing shares. ${advice}`,
        range: frontmatter.range('name'),
        source: 'frontmatter',
      },
    ]
  }
}
