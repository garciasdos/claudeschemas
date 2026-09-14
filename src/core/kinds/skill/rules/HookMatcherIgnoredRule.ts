import type { Diagnostic, Severity } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { Rule } from '../../../rules/types'
import { lineRange } from '../../../document/positions'
import { SkillFrontmatter } from '../SkillFrontmatter'

const eventsWithoutMatcher = new Set([
  'UserPromptSubmit',
  'PostToolBatch',
  'Stop',
  'TeammateIdle',
  'TaskCreated',
  'TaskCompleted',
  'WorktreeCreate',
  'WorktreeRemove',
  'MessageDisplay',
  'CwdChanged',
])

const indentOf = (line: string): number => line.length - line.trimStart().length

const isMatcherLine = (line: string): boolean => /^\s*-?\s*matcher\s*:/.test(line)

export class HookMatcherIgnoredRule implements Rule {
  readonly id = 'skill/hook-matcher-ignored'
  readonly severity: Severity = 'warning'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    const raw = document.frontmatter
    if (frontmatter === null || raw === null) {
      return []
    }
    const hooks = frontmatter.raw('hooks')
    if (typeof hooks !== 'object' || hooks === null || Array.isArray(hooks)) {
      return []
    }
    const lines = raw.raw.split('\n')
    const firstLine = raw.range.start.line + 1
    const diagnostics: Diagnostic[] = []
    for (const event of Object.keys(hooks)) {
      if (!eventsWithoutMatcher.has(event)) {
        continue
      }
      for (const index of this.matcherLinesUnder(lines, event)) {
        diagnostics.push({
          ruleId: this.id,
          severity: this.severity,
          message: `"${event}" hooks fire on every occurrence and ignore "matcher". Remove the matcher, or move the hook to an event that filters by it, such as PreToolUse.`,
          range: lineRange(firstLine + index, (lines[index] ?? '').length),
          source: 'frontmatter',
        })
      }
    }
    return diagnostics
  }

  private matcherLinesUnder(lines: readonly string[], event: string): number[] {
    const eventPattern = new RegExp(`^\\s+${event}\\s*:`)
    const eventIndex = lines.findIndex((line) => eventPattern.test(line))
    if (eventIndex === -1) {
      return []
    }
    const eventIndent = indentOf(lines[eventIndex] ?? '')
    const found: number[] = []
    for (let index = eventIndex + 1; index < lines.length; index += 1) {
      const line = lines[index] ?? ''
      if (line.trim().length > 0 && indentOf(line) <= eventIndent) {
        break
      }
      if (isMatcherLine(line)) {
        found.push(index)
      }
    }
    return found
  }
}
