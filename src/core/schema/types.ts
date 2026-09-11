export interface SchemaViolation {
  ruleId: string
  message: string
  path: readonly (string | number)[]
}

export interface SchemaValidator {
  validate(data: unknown): SchemaViolation[]
}
