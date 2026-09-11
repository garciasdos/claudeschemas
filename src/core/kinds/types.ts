import type { Diagnostic } from '../diagnostics/types'

export interface DocumentKind {
  readonly id: string
  readonly label: string
  readonly schemaUrl: string
  readonly sample: string
  validate(text: string): Diagnostic[]
}

export interface DocumentKindRegistry {
  register(kind: DocumentKind): void
  get(id: string): DocumentKind | undefined
  list(): readonly DocumentKind[]
}
