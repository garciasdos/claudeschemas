import type { Rule } from '../../../../rules/types'
import { DescriptionBrevityRule } from './DescriptionBrevityRule'
import { DescriptionOpenerRule } from './DescriptionOpenerRule'
import { DescriptionSpecLengthRule } from './DescriptionSpecLengthRule'
import { DescriptionTriggerRule } from './DescriptionTriggerRule'
import { DescriptionVoiceRule } from './DescriptionVoiceRule'
import { EmptyBodyRule } from './EmptyBodyRule'
import { HiddenArgumentHintRule } from './HiddenArgumentHintRule'
import { MissingArgumentHintRule } from './MissingArgumentHintRule'
import { NameSaysSkillRule } from './NameSaysSkillRule'
import { PlaceholderTextRule } from './PlaceholderTextRule'
import { ShellWithoutAllowedToolsRule } from './ShellWithoutAllowedToolsRule'
import { UnstructuredBodyRule } from './UnstructuredBodyRule'
import { UnusedArgumentsRule } from './UnusedArgumentsRule'

export const createSkillHintRules = (): Rule[] => [
  new NameSaysSkillRule(),
  new DescriptionOpenerRule(),
  new DescriptionVoiceRule(),
  new DescriptionBrevityRule(),
  new DescriptionTriggerRule(),
  new DescriptionSpecLengthRule(),
  new MissingArgumentHintRule(),
  new HiddenArgumentHintRule(),
  new UnusedArgumentsRule(),
  new EmptyBodyRule(),
  new UnstructuredBodyRule(),
  new PlaceholderTextRule(),
  new ShellWithoutAllowedToolsRule(),
]
