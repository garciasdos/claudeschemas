import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { SkillFrontmatter } from '../../SkillFrontmatter'
import { findInBody } from '../bodyMatches'

const shellFence = /^(?:```|~~~)[ \t]*(bash|sh|shell|zsh|console|powershell)\b[^\n]*/gm

export class ShellWithoutAllowedToolsRule implements Rule {
  readonly id = 'skill/shell-without-allowed-tools'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    const frontmatter = SkillFrontmatter.from(document)
    if (frontmatter === null || (frontmatter.list('allowed-tools') ?? []).length > 0) {
      return []
    }
    const fence = findInBody(document, shellFence)[0]
    if (fence === undefined) {
      return []
    }
    return [
      {
        ruleId: this.id,
        severity: this.severity,
        message: `The instructions include a ${fence.value[1] ?? 'shell'} block but "allowed-tools" is not set, so each command prompts the user for permission when the skill runs. List the commands it needs, such as Bash(npm test:*).`,
        range: fence.range,
        source: 'body',
      },
    ]
  }
}
