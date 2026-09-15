import skillsApiSchema from '../../../../../schemas/skill.skills-api.schema.json'
import agentSkillsSpecSchema from '../../../../../schemas/skill.agent-skills-spec.schema.json'
import { AjvSchemaValidator } from '../../../schema/AjvSchemaValidator'
import type { SkillPortabilityTarget, SkillTargetSelection } from './types'

export const claudeCodeTargetId = 'claude-code'
export const skillsApiTargetId = 'skills-api'
export const agentSkillsSpecTargetId = 'agent-skills-spec'
export const allTargetsId = 'all'

export const claudeCodeSchemaUrl = 'schemas/skill.schema.json'
export const skillsApiSchemaUrl = 'schemas/skill.skills-api.schema.json'
export const agentSkillsSpecSchemaUrl = 'schemas/skill.agent-skills-spec.schema.json'

const claudeCodeOnlyHintRuleIds: ReadonlySet<string> = new Set([
  'skill/missing-argument-hint',
  'skill/argument-hint-hidden',
  'skill/unused-arguments',
  'skill/inline-command-without-bash',
])

const specFields = ['name', 'description', 'license', 'allowed-tools', 'compatibility', 'metadata']

const createSkillsApiTarget = (): SkillPortabilityTarget => ({
  id: skillsApiTargetId,
  label: 'claude.ai / Skills API',
  schemaUrl: skillsApiSchemaUrl,
  schemaValidator: new AjvSchemaValidator(skillsApiSchema),
  acceptedFields: specFields,
  unsupportedFieldConsequence:
    'Uploading this file to claude.ai or through the Skills API fails with an unexpected-key error.',
  requirementConsequence: 'claude.ai and the Skills API reject the upload otherwise.',
  bodyPlace: 'on claude.ai and through the Skills API',
  suppressedRuleIds: claudeCodeOnlyHintRuleIds,
})

const createAgentSkillsSpecTarget = (): SkillPortabilityTarget => ({
  id: agentSkillsSpecTargetId,
  label: 'Agent Skills spec',
  schemaUrl: agentSkillsSpecSchemaUrl,
  schemaValidator: new AjvSchemaValidator(agentSkillsSpecSchema),
  acceptedFields: specFields,
  unsupportedFieldConsequence:
    'The Agent Skills spec defines only name, description, license, allowed-tools, compatibility and metadata, so an agent that follows the spec ignores it.',
  requirementConsequence: 'The Agent Skills spec requires it; Claude Code is more permissive.',
  bodyPlace: 'outside Claude Code',
  suppressedRuleIds: claudeCodeOnlyHintRuleIds,
})

export const createSkillTargets = (): SkillTargetSelection[] => {
  const skillsApi = createSkillsApiTarget()
  const agentSkillsSpec = createAgentSkillsSpecTarget()
  return [
    {
      id: claudeCodeTargetId,
      label: 'Claude Code',
      schemaUrl: claudeCodeSchemaUrl,
      portabilityTargets: [],
    },
    {
      id: skillsApiTargetId,
      label: skillsApi.label,
      schemaUrl: skillsApi.schemaUrl,
      portabilityTargets: [skillsApi],
    },
    {
      id: agentSkillsSpecTargetId,
      label: agentSkillsSpec.label,
      schemaUrl: agentSkillsSpec.schemaUrl,
      portabilityTargets: [agentSkillsSpec],
    },
    {
      id: allTargetsId,
      label: 'All targets',
      schemaUrl: claudeCodeSchemaUrl,
      portabilityTargets: [skillsApi, agentSkillsSpec],
    },
  ]
}
