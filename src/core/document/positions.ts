import type { Position, Range } from '../diagnostics/types'

export const createPosition = (line: number, column: number): Position => ({ line, column })

export const createRange = (start: Position, end: Position): Range => ({ start, end })

export const shiftPosition = (text: string, offset: number, origin: Position): Position => {
  const consumed = text.slice(0, offset)
  const lastBreak = consumed.lastIndexOf('\n')
  if (lastBreak === -1) {
    return createPosition(origin.line, origin.column + offset)
  }
  const lineCount = consumed.split('\n').length - 1
  return createPosition(origin.line + lineCount, offset - lastBreak)
}

export const shiftRange = (text: string, start: number, end: number, origin: Position): Range =>
  createRange(shiftPosition(text, start, origin), shiftPosition(text, end, origin))

export const lineRange = (line: number, length: number): Range =>
  createRange(createPosition(line, 1), createPosition(line, length + 1))
