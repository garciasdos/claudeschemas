import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'
import { findUnescapedOutsideFences } from '../bodyMatches'
import { positionalPlaceholder } from './argumentUsage'

const hasArgumentHint = (frontmatter: SkillFrontmatter): boolean => {
  const hint = frontmatter.raw('argument-hint')
  if (typeof hint === 'string') {
    return hint.trim().length > 0
  }
  return Array.isArray(hint) && hint.length > 0
}

export class MissingArgumentHintRule implements Rule {
  readonly id = 'skill/missing-argument-hint'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null || hasArgumentHint(frontmatter)) {
      return []
    }
    if (frontmatter.boolean('user-invocable') === false) {
      return []
    }
    const declared = frontmatter.list('arguments') ?? []
    if (declared.length > 0) {
      return [this.report(frontmatter, frontmatter.range('arguments'), 'frontmatter')]
    }
    const placeholder = findUnescapedOutsideFences(document, positionalPlaceholder)[0]
    if (placeholder === undefined) {
      return []
    }
    return [this.report(frontmatter, placeholder.range, 'body')]
  }

  private report(
    frontmatter: SkillFrontmatter,
    range: Diagnostic['range'],
    source: Diagnostic['source'],
  ): Diagnostic {
    const name = frontmatter.string('name') ?? 'name'
    return {
      ruleId: this.id,
      severity: this.severity,
      message: `The skill takes arguments but has no "argument-hint", so autocomplete in the / menu shows nothing after "/${name}". Add one such as "[issue-number]" so people know what to type.`,
      range,
      source,
    }
  }
}
