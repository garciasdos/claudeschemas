import { InMemoryDocumentKindRegistry } from './kinds/InMemoryDocumentKindRegistry'
import type { DocumentKindRegistry } from './kinds/types'
import { createSkillDocumentKind } from './kinds/skill/createSkillDocumentKind'

export function createDefaultRegistry(): DocumentKindRegistry {
  const registry = new InMemoryDocumentKindRegistry()
  registry.register(createSkillDocumentKind())
  return registry
}
