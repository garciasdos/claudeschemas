import type { Diagnostic } from '../diagnostics/types'

export interface DocumentTarget {
  readonly id: string
  readonly label: string
  readonly schemaUrl: string
}

export interface PortableDocument {
  readonly text: string
  readonly notes: readonly string[]
}

export interface DocumentKind {
  readonly id: string
  readonly label: string
  readonly schemaUrl: string
  readonly sample: string
  readonly targets: readonly DocumentTarget[]
  readonly defaultTargetId: string
  validate(text: string, targetId?: string): Diagnostic[]
  toPortable(text: string, targetId: string): PortableDocument | null
}

export interface DocumentKindRegistry {
  register(kind: DocumentKind): void
  get(id: string): DocumentKind | undefined
  list(): readonly DocumentKind[]
}
