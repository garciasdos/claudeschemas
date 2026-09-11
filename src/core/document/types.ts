import type { Range } from '../diagnostics/types'

export interface Frontmatter {
  raw: string
  data: unknown
  range: Range
  parseError?: { message: string; range: Range }
}

export interface ParsedDocument {
  text: string
  lines: readonly string[]
  frontmatter: Frontmatter | null
  body: { text: string; range: Range }
}

export interface DocumentParser {
  parse(text: string): ParsedDocument
}
