import { Text } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import type { Diagnostic } from '../../src/core'
import {
  positionToOffset,
  rangeToOffsets,
  toLintDiagnostics,
} from '../../src/web/editor/diagnosticMapper'

const document = Text.of(['---', 'name: demo', '---', '', 'Body line'])

const diagnostic = (
  startLine: number,
  startColumn: number,
  endLine: number,
  endColumn: number,
): Diagnostic => ({
  ruleId: 'demo.rule',
  severity: 'warning',
  message: 'Demo message',
  range: {
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn },
  },
  source: 'frontmatter',
})

describe('positionToOffset', () => {
  it('maps the first character of the document to offset zero', () => {
    expect(positionToOffset(document, { line: 1, column: 1 })).toBe(0)
  })

  it('maps a one-based column to an offset inside its line', () => {
    expect(positionToOffset(document, { line: 2, column: 7 })).toBe(10)
  })

  it('clamps a column past the end of the line to the line end', () => {
    expect(positionToOffset(document, { line: 2, column: 999 })).toBe(14)
  })

  it('clamps a column below one to the line start', () => {
    expect(positionToOffset(document, { line: 2, column: 0 })).toBe(4)
  })

  it('clamps a line past the end of the document to the last line', () => {
    expect(positionToOffset(document, { line: 42, column: 1 })).toBe(20)
  })
})

describe('rangeToOffsets', () => {
  it('maps a single line range to its start and end offsets', () => {
    expect(rangeToOffsets(document, diagnostic(2, 1, 2, 5).range)).toEqual({ from: 4, to: 8 })
  })

  it('maps a multi line range across line breaks', () => {
    expect(rangeToOffsets(document, diagnostic(1, 1, 3, 4).range)).toEqual({ from: 0, to: 18 })
  })

  it('widens an empty range to one character', () => {
    expect(rangeToOffsets(document, diagnostic(2, 3, 2, 3).range)).toEqual({ from: 6, to: 7 })
  })

  it('keeps an empty range empty on an empty line', () => {
    expect(rangeToOffsets(document, diagnostic(4, 1, 4, 1).range)).toEqual({ from: 19, to: 19 })
  })

  it('does not produce an end before the start when the range is inverted', () => {
    const offsets = rangeToOffsets(document, diagnostic(3, 2, 1, 1).range)
    expect(offsets.to).toBeGreaterThanOrEqual(offsets.from)
  })
})

describe('toLintDiagnostics', () => {
  it('carries severity, message and rule id across', () => {
    expect(toLintDiagnostics([diagnostic(2, 1, 2, 5)], document)).toEqual([
      {
        from: 4,
        to: 8,
        severity: 'warning',
        message: 'Demo message',
        source: 'demo.rule',
      },
    ])
  })

  it('maps an empty list to an empty list', () => {
    expect(toLintDiagnostics([], document)).toEqual([])
  })
})
