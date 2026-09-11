import { load } from 'js-yaml'
import type { Position, Range } from '../diagnostics/types'
import type { DocumentParser, Frontmatter, ParsedDocument } from './types'
import { createPosition, createRange, lineRange } from './positions'

const delimiterPattern = /^---[ \t]*$/

interface YamlMark {
  line: number
  column: number
}

const readMark = (error: unknown): YamlMark | null => {
  if (typeof error !== 'object' || error === null || !('mark' in error)) {
    return null
  }
  const mark: unknown = error.mark
  if (typeof mark !== 'object' || mark === null) {
    return null
  }
  const line: unknown = (mark as { line?: unknown }).line
  const column: unknown = (mark as { column?: unknown }).column
  if (typeof line !== 'number' || typeof column !== 'number') {
    return null
  }
  return { line, column }
}

const readMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message.split('\n')[0] ?? error.message
  }
  return 'The frontmatter is not valid YAML.'
}

const endOfDocument = (lines: readonly string[]): Position =>
  createPosition(lines.length, (lines[lines.length - 1] ?? '').length + 1)

const findClosingDelimiter = (lines: readonly string[]): number => {
  for (let index = 1; index < lines.length; index += 1) {
    if (delimiterPattern.test(lines[index] ?? '')) {
      return index
    }
  }
  return -1
}

export class MarkdownFrontmatterParser implements DocumentParser {
  parse(text: string): ParsedDocument {
    const lines = text.split(/\r?\n/)
    if (!delimiterPattern.test(lines[0] ?? '')) {
      return {
        text,
        lines,
        frontmatter: null,
        body: {
          text,
          range: createRange(createPosition(1, 1), endOfDocument(lines)),
        },
      }
    }

    const closingIndex = findClosingDelimiter(lines)
    if (closingIndex === -1) {
      return this.unterminated(text, lines)
    }

    const raw = lines.slice(1, closingIndex).join('\n')
    const frontmatterRange = createRange(
      createPosition(1, 1),
      createPosition(closingIndex + 1, (lines[closingIndex] ?? '').length + 1),
    )
    const bodyLines = lines.slice(closingIndex + 1)
    const bodyStart =
      bodyLines.length === 0 ? frontmatterRange.end : createPosition(closingIndex + 2, 1)
    const bodyEnd = bodyLines.length === 0 ? frontmatterRange.end : endOfDocument(lines)

    return {
      text,
      lines,
      frontmatter: this.readFrontmatter(raw, frontmatterRange),
      body: {
        text: bodyLines.join('\n'),
        range: createRange(bodyStart, bodyEnd),
      },
    }
  }

  private unterminated(text: string, lines: readonly string[]): ParsedDocument {
    const raw = lines.slice(1).join('\n')
    const range = createRange(createPosition(1, 1), endOfDocument(lines))
    return {
      text,
      lines,
      frontmatter: {
        raw,
        data: undefined,
        range,
        parseError: {
          message: 'The frontmatter block opened with --- is never closed.',
          range: lineRange(1, (lines[0] ?? '').length),
        },
      },
      body: {
        text: '',
        range: createRange(range.end, range.end),
      },
    }
  }

  private readFrontmatter(raw: string, range: Range): Frontmatter {
    try {
      return { raw, data: load(raw), range }
    } catch (error) {
      return {
        raw,
        data: undefined,
        range,
        parseError: {
          message: readMessage(error),
          range: this.errorRange(raw, range, error),
        },
      }
    }
  }

  private errorRange(raw: string, range: Range, error: unknown): Range {
    const mark = readMark(error)
    if (mark === null) {
      return range
    }
    const rawLines = raw.split('\n')
    const line = range.start.line + 1 + mark.line
    const length = (rawLines[mark.line] ?? '').length
    return createRange(
      createPosition(line, mark.column + 1),
      createPosition(line, Math.max(length, mark.column) + 1),
    )
  }
}
