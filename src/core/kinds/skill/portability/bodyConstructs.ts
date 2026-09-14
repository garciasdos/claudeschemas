import type { Range } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import { shiftRange } from '../../../document/positions'

export type SkillBodyConstructKind = 'injection' | 'argument' | 'variable'

export interface SkillBodyConstruct {
  readonly kind: SkillBodyConstructKind
  readonly text: string
  readonly range: Range
  readonly start: number
  readonly end: number
  readonly removable: boolean
}

interface BodyLine {
  readonly text: string
  readonly start: number
}

const fenceOpener = /^ {0,3}(`{3,}|~{3,})(.*)$/
const inlineInjection = /(?<=^|\s)!`[^`\n]+`/g
const claudeVariable = /\$\{CLAUDE_[A-Za-z0-9_]*\}/g
const positionalArgument = /\$(?:ARGUMENTS(?:\[\d+\])?|\d+)/g

const namedArgumentPattern = (names: readonly string[]): RegExp | null => {
  const escaped = names
    .filter((name) => /^[A-Za-z0-9_-]+$/.test(name))
    .map((name) => name.replace(/-/g, '\\-'))
  return escaped.length === 0 ? null : new RegExp(`\\$(?:${escaped.join('|')})\\b`, 'g')
}

const readLines = (text: string): BodyLine[] => {
  const lines: BodyLine[] = []
  let start = 0
  for (const line of text.split('\n')) {
    lines.push({ text: line, start })
    start += line.length + 1
  }
  return lines
}

const isEscapedAt = (text: string, index: number): boolean =>
  text[index - 1] === '\\' && text[index - 2] !== '\\'

const closesFence = (line: string, marker: string): boolean => {
  const match = fenceOpener.exec(line)
  return (
    match !== null &&
    match[1] !== undefined &&
    match[1][0] === marker[0] &&
    match[1].length >= marker.length &&
    (match[2] ?? '').trim().length === 0
  )
}

export class SkillBodyConstructScanner {
  constructor(private readonly argumentNames: readonly string[] = []) {}

  scan(document: ParsedDocument): SkillBodyConstruct[] {
    const text = document.body.text
    const lines = readLines(text)
    const constructs: SkillBodyConstruct[] = []
    let index = 0

    while (index < lines.length) {
      const line = lines[index]
      if (line === undefined) {
        break
      }
      const opener = fenceOpener.exec(line.text)
      const marker = opener?.[1]
      if (marker === undefined) {
        constructs.push(...this.scanLine(document, line))
        index += 1
        continue
      }
      const closingIndex = this.findClosingFence(lines, index, marker)
      if ((opener?.[2] ?? '').trim() === '!') {
        constructs.push(this.injectionBlock(document, lines, index, closingIndex))
      }
      index = closingIndex + 1
    }

    return constructs.sort((left, right) => left.start - right.start)
  }

  private findClosingFence(lines: readonly BodyLine[], openIndex: number, marker: string): number {
    for (let index = openIndex + 1; index < lines.length; index += 1) {
      if (closesFence(lines[index]?.text ?? '', marker)) {
        return index
      }
    }
    return lines.length - 1
  }

  private injectionBlock(
    document: ParsedDocument,
    lines: readonly BodyLine[],
    openIndex: number,
    closingIndex: number,
  ): SkillBodyConstruct {
    const open = lines[openIndex]
    const close = lines[closingIndex]
    const start = open?.start ?? 0
    const end = (close?.start ?? start) + (close?.text.length ?? 0)
    return this.create(
      document,
      'injection',
      document.body.text.slice(start, end),
      start,
      end,
      true,
    )
  }

  private scanLine(document: ParsedDocument, line: BodyLine): SkillBodyConstruct[] {
    const injections = this.matchesIn(line, inlineInjection)
    const covered = (offset: number): boolean =>
      injections.some((match) => offset >= match.start && offset < match.end)
    const substitutions = [
      ...this.matchesIn(line, claudeVariable),
      ...this.matchesIn(line, positionalArgument),
      ...this.namedArgumentMatches(line),
    ].filter((match) => !covered(match.start) && !isEscapedAt(document.body.text, match.start))

    return [
      ...injections.map((match) =>
        this.create(document, 'injection', match.text, match.start, match.end, true),
      ),
      ...substitutions.map((match) =>
        this.create(
          document,
          match.text.startsWith('${') ? 'variable' : 'argument',
          match.text,
          match.start,
          match.end,
          false,
        ),
      ),
    ]
  }

  private namedArgumentMatches(line: BodyLine): { text: string; start: number; end: number }[] {
    const pattern = namedArgumentPattern(this.argumentNames)
    return pattern === null ? [] : this.matchesIn(line, pattern)
  }

  private matchesIn(
    line: BodyLine,
    pattern: RegExp,
  ): { text: string; start: number; end: number }[] {
    const scanner = new RegExp(pattern.source, pattern.flags)
    const matches: { text: string; start: number; end: number }[] = []
    let match = scanner.exec(line.text)
    while (match !== null) {
      matches.push({
        text: match[0],
        start: line.start + match.index,
        end: line.start + match.index + match[0].length,
      })
      match = scanner.exec(line.text)
    }
    return matches
  }

  private create(
    document: ParsedDocument,
    kind: SkillBodyConstructKind,
    text: string,
    start: number,
    end: number,
    removable: boolean,
  ): SkillBodyConstruct {
    return {
      kind,
      text,
      range: shiftRange(document.body.text, start, end, document.body.range.start),
      start,
      end,
      removable,
    }
  }
}
