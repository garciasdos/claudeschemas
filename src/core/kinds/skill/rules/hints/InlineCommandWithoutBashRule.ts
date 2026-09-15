import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'
import { findOutsideFences } from '../bodyMatches'
import { toolBaseName, toolEntries } from '../toolEntries'

const inlineCommand = /(?<=^|\s)!`[^`\n]+`/gm
const shellTools = new Set(['Bash', 'PowerShell'])

export class InlineCommandWithoutBashRule implements Rule {
  readonly id = 'skill/inline-command-without-bash'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null) {
      return []
    }
    const grantsShell = toolEntries(frontmatter.raw('allowed-tools')).some((entry) =>
      shellTools.has(toolBaseName(entry)),
    )
    if (grantsShell) {
      return []
    }
    const command = findOutsideFences(document, inlineCommand)[0]
    if (command === undefined) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `${command.value[0]} runs before the skill loads and never prompts for permission: if no rule allows the command, the whole invocation aborts. Pre-approve it in "allowed-tools", such as Bash(git status:*), so the skill loads reliably.`,
        range: command.range,
        source: 'body',
      },
    ]
  }
}
