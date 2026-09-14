import type { Diagnostic, Range } from '../../../diagnostics/types'
import type { KeyRangeLocator } from '../../../document/FrontmatterKeyLocator'
import type { ParsedDocument } from '../../../document/types'
import type { SchemaValidator, SchemaViolation } from '../../../schema/types'
import type { SkillPortabilityTarget } from '../targets/types'
import { FrontmatterKeyLocator } from '../../../document/FrontmatterKeyLocator'

const unsupportedFieldRuleId = 'portability/unsupported-field'
const fieldConstraintRuleId = 'portability/field-constraint'
const unknownFieldViolationRuleId = 'schema/unknown-field'

const identityOf = (violation: SchemaViolation): string =>
  `${violation.ruleId} ${violation.path.join('.')}`

const fieldNameOf = (violation: SchemaViolation): string =>
  String(violation.path[violation.path.length - 1] ?? '')

export class SkillFrontmatterPortabilityCheck {
  constructor(private readonly baseValidator: SchemaValidator) {}

  check(document: ParsedDocument, target: SkillPortabilityTarget): Diagnostic[] {
    const frontmatter = document.frontmatter
    if (frontmatter === null || frontmatter.parseError !== undefined) {
      return []
    }
    const data = frontmatter.data ?? {}
    const reportedByClaudeCode = new Set(this.baseValidator.validate(data).map(identityOf))
    const locator = new FrontmatterKeyLocator(frontmatter)
    return target.schemaValidator
      .validate(data)
      .filter((violation) => !reportedByClaudeCode.has(identityOf(violation)))
      .map((violation) => this.report(violation, target, locator, frontmatter.range))
  }

  private report(
    violation: SchemaViolation,
    target: SkillPortabilityTarget,
    locator: KeyRangeLocator,
    fallback: Range,
  ): Diagnostic {
    const unsupportedField = violation.ruleId === unknownFieldViolationRuleId
    return {
      ruleId: unsupportedField ? unsupportedFieldRuleId : fieldConstraintRuleId,
      severity: 'error',
      message: unsupportedField
        ? `\`${fieldNameOf(violation)}\` is a Claude Code-only field. ${target.unsupportedFieldConsequence} Move it under \`metadata\`, or remove it.`
        : `${violation.message} ${target.requirementConsequence}`,
      range: locator.rangeFor(violation.path) ?? fallback,
      source: 'frontmatter',
      portability: { targets: [target.id] },
    }
  }
}
