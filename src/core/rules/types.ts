import type { Diagnostic, Severity } from '../diagnostics/types'
import type { ParsedDocument } from '../document/types'

export interface Rule {
  readonly id: string
  readonly severity: Severity
  check(document: ParsedDocument): Diagnostic[]
}
