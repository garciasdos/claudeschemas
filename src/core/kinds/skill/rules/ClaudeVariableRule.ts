import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { findInBody } from './bodyMatches'

const claudeVariable = /\$\{(CLAUDE_[A-Za-z0-9_]*)\}/g

const knownVariables = [
  'CLAUDE_SESSION_ID',
  'CLAUDE_EFFORT',
  'CLAUDE_SKILL_DIR',
  'CLAUDE_PROJECT_DIR',
  'CLAUDE_PLUGIN_ROOT',
  'CLAUDE_PLUGIN_DATA',
] as const

const known = new Set<string>(knownVariables)

export class ClaudeVariableRule implements Rule {
  readonly id = 'skill/unknown-claude-variable'
  readonly severity: Severity = 'warning'

  check(document: ParsedDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = []
    for (const match of findInBody(document, claudeVariable)) {
      const name = match.value[1]
      if (name === undefined || known.has(name)) {
        continue
      }
      diagnostics.push({
        ruleId: this.id,
        severity: this.severity,
        message: `"\${${name}}" is not a Claude Code variable and is left in the text as written. Known variables are ${knownVariables.join(', ')}.`,
        range: match.range,
        source: 'body',
      })
    }
    return diagnostics
  }
}
