import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { SkillFrontmatter } from '../SkillFrontmatter'
import { findInBody, isEscaped } from './bodyMatches'

const indexedPlaceholder = /\$(?:ARGUMENTS\[(\d+)\]|(\d+))/g
const namedPlaceholder = /\$([a-z][A-Za-z0-9_-]*)/g

export class ArgumentPlaceholderRule implements Rule {
  readonly id = 'skill/argument-placeholder'
  readonly severity: Severity = 'warning'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null || !frontmatter.has('arguments')) {
      return []
    }
    const names = frontmatter.list('arguments')
    if (names === null) {
      return []
    }
    const indexed = this.checkIndexes(document, names)
    if (!Array.isArray(frontmatter.raw('arguments'))) {
      return indexed
    }
    return [...indexed, ...this.checkNames(document, names)]
  }

  private checkIndexes(document: ParsedDocument, names: readonly string[]): Diagnostic[] {
    const diagnostics: Diagnostic[] = []
    for (const match of findInBody(document, indexedPlaceholder)) {
      if (isEscaped(document.body.text, match.value.index)) {
        continue
      }
      const index = Number(match.value[1] ?? match.value[2])
      if (index < names.length) {
        continue
      }
      diagnostics.push({
        ruleId: this.id,
        severity: this.severity,
        message: `"${match.value[0]}" is out of range: "arguments" declares ${this.declared(names)}.`,
        range: match.range,
        source: 'body',
      })
    }
    return diagnostics
  }

  private checkNames(document: ParsedDocument, names: readonly string[]): Diagnostic[] {
    const declared = new Set(names)
    const diagnostics: Diagnostic[] = []
    for (const match of findInBody(document, namedPlaceholder)) {
      const name = match.value[1]
      if (name === undefined || declared.has(name)) {
        continue
      }
      if (isEscaped(document.body.text, match.value.index)) {
        continue
      }
      diagnostics.push({
        ruleId: this.id,
        severity: this.severity,
        message: `"$${name}" is not a declared argument. "arguments" declares ${this.declared(names)}. Escape it as "\\$${name}" if you meant the literal text.`,
        range: match.range,
        source: 'body',
      })
    }
    return diagnostics
  }

  private declared(names: readonly string[]): string {
    if (names.length === 0) {
      return 'no arguments'
    }
    const listed = names.map((name) => `"${name}"`).join(', ')
    return `${names.length} ${names.length === 1 ? 'argument' : 'arguments'} (${listed})`
  }
}
