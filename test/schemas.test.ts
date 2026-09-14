import Ajv from 'ajv'
import { describe, expect, it } from 'vitest'

const draft07Metaschema = 'http://json-schema.org/draft-07/schema#'

const schemaSources = import.meta.glob<string>('../schemas/*.schema.json', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const schemaEntries = Object.entries(schemaSources)

const parseSchema = (source: string): Record<string, unknown> =>
  JSON.parse(source) as Record<string, unknown>

const collectReferences = (node: unknown, references: string[] = []): string[] => {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectReferences(item, references)
    }
    return references
  }
  if (node === null || typeof node !== 'object') {
    return references
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === '$ref' && typeof value === 'string') {
      references.push(value)
    }
    collectReferences(value, references)
  }
  return references
}

const compileAlone = (schema: Record<string, unknown>): void => {
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true })
  ajv.compile(schema)
}

describe('published JSON Schemas', () => {
  it('covers every schema file in the repository', () => {
    expect(schemaEntries.length).toBeGreaterThanOrEqual(3)
  })

  it.each(schemaEntries)('%s parses as JSON', (_path, source) => {
    expect(() => parseSchema(source)).not.toThrow()
  })

  it.each(schemaEntries)('%s declares the draft-07 metaschema and an $id', (_path, source) => {
    const schema = parseSchema(source)
    expect(schema.$schema).toBe(draft07Metaschema)
    expect(schema.$id).toEqual(expect.stringMatching(/\S/))
  })

  it.each(schemaEntries)('%s compiles without any other schema registered', (_path, source) => {
    expect(() => compileAlone(parseSchema(source))).not.toThrow()
  })

  it.each(schemaEntries)('%s refers only to its own definitions', (_path, source) => {
    for (const reference of collectReferences(parseSchema(source))) {
      expect(reference.startsWith('#/'), `${reference} is an external reference`).toBe(true)
    }
  })
})
