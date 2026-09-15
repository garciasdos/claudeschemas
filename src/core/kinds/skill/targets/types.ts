import type { SchemaValidator } from '../../../schema/types'

export interface SkillPortabilityTarget {
  readonly id: string
  readonly label: string
  readonly schemaUrl: string
  readonly schemaValidator: SchemaValidator
  readonly acceptedFields: readonly string[]
  readonly unsupportedFieldConsequence: string
  readonly requirementConsequence: string
  readonly bodyPlace: string
  readonly suppressedRuleIds: ReadonlySet<string>
}

export interface SkillTargetSelection {
  readonly id: string
  readonly label: string
  readonly schemaUrl: string
  readonly portabilityTargets: readonly SkillPortabilityTarget[]
}
