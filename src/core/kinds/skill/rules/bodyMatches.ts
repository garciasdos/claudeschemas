import type { Range } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import { shiftRange } from '../../../document/positions'

export interface BodyMatch {
  value: RegExpExecArray
  range: Range
}

export const countBodyLines = (document: ParsedDocument): number => {
  if (document.body.text.length === 0) {
    return 0
  }
  const lines = document.body.text.split('\n')
  return lines[lines.length - 1] === '' ? lines.length - 1 : lines.length
}

export const isEscaped = (text: string, index: number): boolean =>
  text[index - 1] === '\\' && text[index - 2] !== '\\'

export const findInBody = (document: ParsedDocument, pattern: RegExp): BodyMatch[] => {
  const text = document.body.text
  const origin = document.body.range.start
  const scanner = new RegExp(
    pattern.source,
    pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`,
  )
  const matches: BodyMatch[] = []
  let value = scanner.exec(text)
  while (value !== null) {
    matches.push({
      value,
      range: shiftRange(text, value.index, value.index + value[0].length, origin),
    })
    value = scanner.exec(text)
  }
  return matches
}
