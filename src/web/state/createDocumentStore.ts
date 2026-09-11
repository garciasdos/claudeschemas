import type { DocumentStore } from './DocumentStore'
import { InMemoryDocumentStore } from './InMemoryDocumentStore'
import { WebStorageDocumentStore } from './WebStorageDocumentStore'

export const createDocumentStore = (): DocumentStore => {
  try {
    const probe = 'claudeschemas:probe'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return new WebStorageDocumentStore(window.localStorage)
  } catch {
    return new InMemoryDocumentStore()
  }
}
