import skillSchema from '../../../../schemas/skill.schema.json'
import type { DocumentKind } from '../types'
import { MarkdownFrontmatterParser } from '../../document/MarkdownFrontmatterParser'
import { AjvSchemaValidator } from '../../schema/AjvSchemaValidator'
import { SkillDocumentKind } from './SkillDocumentKind'
import { createSkillRules } from './rules/createSkillRules'
import { skillSample } from './skillSample'
import {
  claudeCodeSchemaUrl,
  claudeCodeTargetId,
  createSkillTargets,
} from './targets/createSkillTargets'
import { SkillBodyPortabilityCheck } from './portability/SkillBodyPortabilityCheck'
import { SkillFrontmatterPortabilityCheck } from './portability/SkillFrontmatterPortabilityCheck'
import { PortableSkillDocumentBuilder } from './portability/PortableSkillDocumentBuilder'

export const skillSchemaUrl = claudeCodeSchemaUrl

export const createSkillDocumentKind = (): DocumentKind => {
  const parser = new MarkdownFrontmatterParser()
  const schemaValidator = new AjvSchemaValidator(skillSchema)
  return new SkillDocumentKind(
    parser,
    schemaValidator,
    createSkillRules(),
    skillSchemaUrl,
    skillSample,
    createSkillTargets(),
    claudeCodeTargetId,
    new SkillFrontmatterPortabilityCheck(schemaValidator),
    new SkillBodyPortabilityCheck(),
    new PortableSkillDocumentBuilder(parser),
  )
}
