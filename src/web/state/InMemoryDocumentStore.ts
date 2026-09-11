import type { DocumentStore } from './DocumentStore'

export class InMemoryDocumentStore implements DocumentStore {
  private readonly documents = new Map<string, string>()

  read(kindId: string): string | null {
    return this.documents.get(kindId) ?? null
  }

  write(kindId: string, text: string): void {
    this.documents.set(kindId, text)
  }
}
