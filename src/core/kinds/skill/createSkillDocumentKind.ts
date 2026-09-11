import skillSchema from '../../../../schemas/skill.schema.json'
import type { DocumentKind } from '../types'
import { MarkdownFrontmatterParser } from '../../document/MarkdownFrontmatterParser'
import { AjvSchemaValidator } from '../../schema/AjvSchemaValidator'
import { SkillDocumentKind } from './SkillDocumentKind'
import { createSkillRules } from './rules/createSkillRules'
import { skillSample } from './skillSample'

export const skillSchemaUrl = 'schemas/skill.schema.json'

export const createSkillDocumentKind = (): DocumentKind =>
  new SkillDocumentKind(
    new MarkdownFrontmatterParser(),
    new AjvSchemaValidator(skillSchema),
    createSkillRules(),
    skillSchemaUrl,
    skillSample,
  )
