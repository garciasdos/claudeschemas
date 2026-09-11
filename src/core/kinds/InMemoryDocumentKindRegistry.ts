import type { DocumentKind, DocumentKindRegistry } from './types'

export class InMemoryDocumentKindRegistry implements DocumentKindRegistry {
  private readonly kinds = new Map<string, DocumentKind>()

  register(kind: DocumentKind): void {
    this.kinds.set(kind.id, kind)
  }

  get(id: string): DocumentKind | undefined {
    return this.kinds.get(id)
  }

  list(): readonly DocumentKind[] {
    return Array.from(this.kinds.values())
  }
}
