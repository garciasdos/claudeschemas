import { InMemoryDocumentKindRegistry } from './kinds/InMemoryDocumentKindRegistry'
import type { DocumentKindRegistry } from './kinds/types'

export function createDefaultRegistry(): DocumentKindRegistry {
  return new InMemoryDocumentKindRegistry()
}
