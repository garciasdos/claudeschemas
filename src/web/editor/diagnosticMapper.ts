import type { Diagnostic as LintDiagnostic } from '@codemirror/lint'
import type { Diagnostic, Position, Range } from '../../core'

export interface LineSpan {
  readonly from: number
  readonly to: number
}

export interface DocumentLines {
  readonly lines: number
  readonly length: number
  line(lineNumber: number): LineSpan
}

export interface OffsetRange {
  readonly from: number
  readonly to: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(Number.isFinite(value) ? value : min, min), max)

const lineAt = (document: DocumentLines, position: Position): LineSpan =>
  document.line(clamp(Math.trunc(position.line), 1, document.lines))

const offsetIn = (line: LineSpan, position: Position): number =>
  clamp(line.from + Math.trunc(position.column) - 1, line.from, line.to)

export const positionToOffset = (document: DocumentLines, position: Position): number =>
  offsetIn(lineAt(document, position), position)

export const rangeToOffsets = (document: DocumentLines, range: Range): OffsetRange => {
  const from = positionToOffset(document, range.start)
  const endLine = lineAt(document, range.end)
  const end = offsetIn(endLine, range.end)
  if (end > from) {
    return { from, to: end }
  }
  return { from, to: Math.min(from + 1, Math.max(endLine.to, from)) }
}

export const toLintDiagnostics = (
  diagnostics: readonly Diagnostic[],
  document: DocumentLines,
): LintDiagnostic[] =>
  diagnostics.map((diagnostic) => {
    const offsets = rangeToOffsets(document, diagnostic.range)
    return {
      from: offsets.from,
      to: offsets.to,
      severity: diagnostic.severity,
      message: diagnostic.message,
      source: diagnostic.ruleId,
    }
  })
