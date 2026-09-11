import type { DocumentStore, KeyValueStorage } from './DocumentStore'

const defaultPrefix = 'claudeschemas:document:'

export class WebStorageDocumentStore implements DocumentStore {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly prefix: string = defaultPrefix,
  ) {}

  read(kindId: string): string | null {
    try {
      return this.storage.getItem(this.prefix + kindId)
    } catch {
      return null
    }
  }

  write(kindId: string, text: string): void {
    try {
      this.storage.setItem(this.prefix + kindId, text)
    } catch {
      return
    }
  }
}
