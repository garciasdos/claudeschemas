import type { Rule } from '../../../rules/types'
import { AgentWithoutForkRule } from './AgentWithoutForkRule'
import { ArgumentPlaceholderRule } from './ArgumentPlaceholderRule'
import { BodyLineCountRule } from './BodyLineCountRule'
import { ClaudeVariableRule } from './ClaudeVariableRule'
import { DescriptionLengthRule } from './DescriptionLengthRule'
import { MissingDescriptionRule } from './MissingDescriptionRule'
import { MissingFrontmatterRule } from './MissingFrontmatterRule'
import { NameFormatRule } from './NameFormatRule'
import { ReservedNameRule } from './ReservedNameRule'
import { UninvokableSkillRule } from './UninvokableSkillRule'
import { createSkillHintRules } from './hints/createSkillHintRules'

export const createSkillRules = (): Rule[] => [
  new MissingFrontmatterRule(),
  new NameFormatRule(),
  new ReservedNameRule(),
  new MissingDescriptionRule(),
  new DescriptionLengthRule(),
  new UninvokableSkillRule(),
  new AgentWithoutForkRule(),
  new ArgumentPlaceholderRule(),
  new ClaudeVariableRule(),
  new BodyLineCountRule(),
  ...createSkillHintRules(),
]
