export interface Position {
  line: number
  column: number
}

export interface Range {
  start: Position
  end: Position
}

export type Severity = 'error' | 'warning' | 'info' | 'hint'

export interface Diagnostic {
  ruleId: string
  severity: Severity
  message: string
  range: Range
  source: 'schema' | 'frontmatter' | 'body'
}
