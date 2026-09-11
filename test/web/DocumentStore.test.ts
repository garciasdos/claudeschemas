import { describe, expect, it, vi } from 'vitest'
import type { KeyValueStorage } from '../../src/web/state/DocumentStore'
import { InMemoryDocumentStore } from '../../src/web/state/InMemoryDocumentStore'
import { WebStorageDocumentStore } from '../../src/web/state/WebStorageDocumentStore'

const fakeStorage = (): KeyValueStorage & { entries: Map<string, string> } => {
  const entries = new Map<string, string>()
  return {
    entries,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value)
    },
  }
}

const throwingStorage = (): KeyValueStorage => ({
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('quota exceeded')
  },
})

describe('InMemoryDocumentStore', () => {
  it('returns null for a kind that was never written', () => {
    expect(new InMemoryDocumentStore().read('skill')).toBeNull()
  })

  it('reads back what it wrote per kind', () => {
    const store = new InMemoryDocumentStore()
    store.write('skill', 'one')
    store.write('agent', 'two')
    expect(store.read('skill')).toBe('one')
    expect(store.read('agent')).toBe('two')
  })

  it('keeps an empty document distinct from a missing one', () => {
    const store = new InMemoryDocumentStore()
    store.write('skill', '')
    expect(store.read('skill')).toBe('')
  })
})

describe('WebStorageDocumentStore', () => {
  it('namespaces keys by prefix', () => {
    const storage = fakeStorage()
    new WebStorageDocumentStore(storage, 'prefix:').write('skill', 'text')
    expect(storage.entries.get('prefix:skill')).toBe('text')
  })

  it('reads back what it wrote', () => {
    const store = new WebStorageDocumentStore(fakeStorage())
    store.write('skill', 'text')
    expect(store.read('skill')).toBe('text')
  })

  it('returns null for a kind that was never written', () => {
    expect(new WebStorageDocumentStore(fakeStorage()).read('skill')).toBeNull()
  })

  it('returns null when reading throws', () => {
    expect(new WebStorageDocumentStore(throwingStorage()).read('skill')).toBeNull()
  })

  it('swallows a write failure', () => {
    const store = new WebStorageDocumentStore(throwingStorage())
    expect(() => {
      store.write('skill', 'text')
    }).not.toThrow()
  })

  it('overwrites the previous document for a kind', () => {
    const storage = fakeStorage()
    const setItem = vi.spyOn(storage, 'setItem')
    const store = new WebStorageDocumentStore(storage)
    store.write('skill', 'first')
    store.write('skill', 'second')
    expect(store.read('skill')).toBe('second')
    expect(setItem).toHaveBeenCalledTimes(2)
  })
})
