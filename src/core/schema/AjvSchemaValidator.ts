import Ajv from 'ajv'
import type { ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import type { SchemaValidator, SchemaViolation } from './types'
import { translateAjvError } from './translateAjvError'

export class AjvSchemaValidator implements SchemaValidator {
  private readonly root: Record<string, unknown>
  private readonly compiled: ValidateFunction

  constructor(schema: Record<string, unknown>) {
    const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true })
    addFormats(ajv)
    this.root = schema
    this.compiled = ajv.compile(schema)
  }

  validate(data: unknown): SchemaViolation[] {
    if (this.compiled(data)) {
      return []
    }
    const errors = this.compiled.errors ?? []
    return errors
      .map((error) => translateAjvError(this.root, error))
      .filter((violation): violation is SchemaViolation => violation !== null)
  }
}
