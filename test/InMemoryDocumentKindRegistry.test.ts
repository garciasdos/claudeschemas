import { describe, expect, it } from 'vitest'
import { InMemoryDocumentKindRegistry } from '../src/core/kinds/InMemoryDocumentKindRegistry'
import type { DocumentKind } from '../src/core/kinds/types'

const makeKind = (id: string): DocumentKind => ({
  id,
  label: id,
  schemaUrl: `/schemas/${id}.json`,
  sample: '',
  targets: [{ id: 'default', label: 'Default', schemaUrl: `/schemas/${id}.json` }],
  defaultTargetId: 'default',
  validate: () => [],
  toPortable: () => null,
})

describe('InMemoryDocumentKindRegistry', () => {
  it('returns undefined for an unregistered id', () => {
    const registry = new InMemoryDocumentKindRegistry()
    expect(registry.get('skill')).toBeUndefined()
  })

  it('returns a registered kind by id', () => {
    const registry = new InMemoryDocumentKindRegistry()
    const kind = makeKind('skill')
    registry.register(kind)
    expect(registry.get('skill')).toBe(kind)
  })

  it('lists all registered kinds', () => {
    const registry = new InMemoryDocumentKindRegistry()
    const skill = makeKind('skill')
    const other = makeKind('other')
    registry.register(skill)
    registry.register(other)
    expect(registry.list()).toEqual([skill, other])
  })

  it('overwrites a kind registered under the same id', () => {
    const registry = new InMemoryDocumentKindRegistry()
    const first = makeKind('skill')
    const second = makeKind('skill')
    registry.register(first)
    registry.register(second)
    expect(registry.list()).toEqual([second])
  })
})
