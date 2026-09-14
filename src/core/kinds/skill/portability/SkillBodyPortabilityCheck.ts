import type { Diagnostic } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import type { SkillPortabilityTarget } from '../targets/types'
import { SkillFrontmatter } from '../SkillFrontmatter'
import { SkillBodyConstructScanner } from './bodyConstructs'
import type { SkillBodyConstruct } from './bodyConstructs'

const dynamicContextRuleId = 'portability/dynamic-context'
const argumentPlaceholderRuleId = 'portability/argument-placeholder'
const environmentVariableRuleId = 'portability/environment-variable'

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

const firstLineOf = (text: string): string => text.split('\n')[0] ?? text

const isBlock = (construct: SkillBodyConstruct): boolean => construct.text.includes('\n')

const injectionMessage = (construct: SkillBodyConstruct, place: string): string =>
  isBlock(construct)
    ? `A \`${firstLineOf(construct.text)}\` dynamic context injection block starts here. ${place} the commands never run and the block reaches the model exactly as written. Remove it, or write out the information the commands would have produced.`
    : `\`${construct.text}\` is Claude Code dynamic context injection. ${place} the command never runs and the line reaches the model exactly as written. Remove it, or write out the information the command would have produced.`

const argumentMessage = (construct: SkillBodyConstruct, place: string): string =>
  `\`${construct.text}\` is a Claude Code argument placeholder. ${place} it is never substituted and the literal text reaches the model. Replace it with the concrete value, or state in prose what the reader should supply.`

const variableMessage = (construct: SkillBodyConstruct, place: string): string =>
  `\`${construct.text}\` is substituted only by Claude Code. ${place} the literal text reaches the model. Use a path relative to the skill directory instead.`

const ruleIdByKind: Record<SkillBodyConstruct['kind'], string> = {
  injection: dynamicContextRuleId,
  argument: argumentPlaceholderRuleId,
  variable: environmentVariableRuleId,
}

const messageByKind: Record<
  SkillBodyConstruct['kind'],
  (construct: SkillBodyConstruct, place: string) => string
> = {
  injection: injectionMessage,
  argument: argumentMessage,
  variable: variableMessage,
}

export class SkillBodyPortabilityCheck {
  check(document: ParsedDocument, target: SkillPortabilityTarget): Diagnostic[] {
    const argumentNames = SkillFrontmatter.from(document)?.list('arguments') ?? []
    const place = capitalize(target.bodyPlace)
    return new SkillBodyConstructScanner(argumentNames).scan(document).map((construct) => ({
      ruleId: ruleIdByKind[construct.kind],
      severity: 'warning' as const,
      message: messageByKind[construct.kind](construct, place),
      range: construct.range,
      source: 'body' as const,
      portability: { targets: [target.id] },
    }))
  }
}
