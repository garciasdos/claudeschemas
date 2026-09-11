import type { Diagnostic, Range } from '../diagnostics/types'
import type { KeyRangeLocator } from '../document/FrontmatterKeyLocator'
import type { SchemaViolation } from './types'

export const createSchemaDiagnostics = (
  violations: readonly SchemaViolation[],
  locator: KeyRangeLocator,
  fallback: Range,
): Diagnostic[] =>
  violations.map((violation) => ({
    ruleId: violation.ruleId,
    severity: 'error',
    message: violation.message,
    range: locator.rangeFor(violation.path) ?? fallback,
    source: 'schema',
  }))
