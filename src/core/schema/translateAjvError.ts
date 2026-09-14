import type { ErrorObject } from 'ajv'
import type { SchemaViolation } from './types'
import { describeProperty } from './describeSchemaNode'
import { suggestFieldName } from './suggestFieldName'

const ruleIdByKeyword: Record<string, string> = {
  additionalProperties: 'schema/unknown-field',
  required: 'schema/missing-field',
  type: 'schema/type',
  enum: 'schema/enum',
  pattern: 'schema/type',
  minimum: 'schema/type',
  maximum: 'schema/type',
  maxLength: 'schema/max-length',
  minLength: 'schema/min-length',
  maxItems: 'schema/max-items',
  minItems: 'schema/min-items',
}

const branchPattern = /\/(?:any|one)Of\/\d+\//

const decodeSegment = (segment: string): string | number => {
  const decoded = segment.replace(/~1/g, '/').replace(/~0/g, '~')
  return /^\d+$/.test(decoded) ? Number(decoded) : decoded
}

const toPath = (instancePath: string): (string | number)[] =>
  instancePath === '' ? [] : instancePath.slice(1).split('/').map(decodeSegment)

const labelOf = (path: readonly (string | number)[]): string => path.join('.')

const readParam = (error: ErrorObject, key: string): unknown =>
  (error.params as Record<string, unknown>)[key]

const expectationMessage = (
  root: Record<string, unknown>,
  path: readonly (string | number)[],
  error: ErrorObject,
): string => {
  const expected = describeProperty(root, path)
  if (expected !== null) {
    return `Field "${labelOf(path)}" must be ${expected}.`
  }
  const allowed = readParam(error, 'allowedValues')
  if (Array.isArray(allowed)) {
    return `Field "${labelOf(path)}" must be one of: ${allowed.map(String).join(', ')}.`
  }
  const type = readParam(error, 'type')
  if (typeof type === 'string') {
    return `Field "${labelOf(path)}" must be ${type === 'object' ? 'an' : 'a'} ${type}.`
  }
  return `Field "${labelOf(path)}" has a value this schema does not allow.`
}

const knownFieldNames = (
  root: Record<string, unknown>,
  path: readonly (string | number)[],
): string[] => {
  const properties = path.length === 0 ? root.properties : null
  return typeof properties === 'object' && properties !== null ? Object.keys(properties) : []
}

const unknownFieldMessage = (
  root: Record<string, unknown>,
  path: readonly (string | number)[],
  property: string,
): string => {
  const suggestion = suggestFieldName(property, knownFieldNames(root, path))
  if (suggestion === null) {
    return `Unknown field "${property}". Remove it, or move it under "metadata".`
  }
  return `Unknown field "${property}". Did you mean "${suggestion}"? Field names are case-sensitive and must be spelled exactly.`
}

export const translateAjvError = (
  root: Record<string, unknown>,
  error: ErrorObject,
): SchemaViolation | null => {
  if (branchPattern.test(error.schemaPath)) {
    return null
  }
  const path = toPath(error.instancePath)
  const ruleId = ruleIdByKeyword[error.keyword] ?? 'schema/invalid-value'

  if (error.keyword === 'additionalProperties') {
    const property = String(readParam(error, 'additionalProperty'))
    return {
      ruleId,
      message: unknownFieldMessage(root, path, property),
      path: [...path, property],
    }
  }

  if (error.keyword === 'required') {
    const property = String(readParam(error, 'missingProperty'))
    return {
      ruleId,
      message:
        path.length === 0
          ? `Missing required field "${property}".`
          : `Field "${labelOf(path)}" is missing the required key "${property}".`,
      path,
    }
  }

  if (path.length === 0) {
    return {
      ruleId,
      message: 'The frontmatter must be a mapping of fields.',
      path,
    }
  }

  if (error.keyword === 'maxLength' || error.keyword === 'minLength') {
    const limit = String(readParam(error, 'limit'))
    const bound = error.keyword === 'maxLength' ? 'at most' : 'at least'
    return {
      ruleId,
      message: `Field "${labelOf(path)}" must be ${bound} ${limit} characters.`,
      path,
    }
  }

  return { ruleId, message: expectationMessage(root, path, error), path }
}
