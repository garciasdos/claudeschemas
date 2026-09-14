import type { Range } from '../../../diagnostics/types'
import type { ParsedDocument } from '../../../document/types'
import { shiftRange } from '../../../document/positions'
import type { BodyLine, FencedRegion } from '../rules/fencedRegions'
import { fencedRegions, isInsideFence, readBodyLines } from '../rules/fencedRegions'

export type SkillBodyConstructKind = 'injection' | 'argument' | 'variable'

export interface SkillBodyConstruct {
  readonly kind: SkillBodyConstructKind
  readonly text: string
  readonly range: Range
  readonly start: number
  readonly end: number
  readonly removable: boolean
}

const inlineInjection = /(?<=^|\s)!`[^`\n]+`/g
const claudeVariable = /\$\{CLAUDE_[A-Za-z0-9_]*\}/g
const positionalArgument = /\$(?:ARGUMENTS(?:\[\d+\])?|\d+)/g

const namedArgumentPattern = (names: readonly string[]): RegExp | null => {
  const escaped = names
    .filter((name) => /^[A-Za-z0-9_-]+$/.test(name))
    .map((name) => name.replace(/-/g, '\\-'))
  return escaped.length === 0 ? null : new RegExp(`\\$(?:${escaped.join('|')})\\b`, 'g')
}

const isEscapedAt = (text: string, index: number): boolean =>
  text[index - 1] === '\\' && text[index - 2] !== '\\'

export class SkillBodyConstructScanner {
  constructor(private readonly argumentNames: readonly string[] = []) {}

  scan(document: ParsedDocument): SkillBodyConstruct[] {
    const regions = fencedRegions(document)
    const blocks = regions
      .filter((region) => region.infoString === '!')
      .map((region) => this.injectionBlock(document, region))
    const inline = readBodyLines(document.body.text)
      .flatMap((line) => this.scanLine(document, line))
      .filter((construct) => !isInsideFence(regions, construct.start))

    return [...blocks, ...inline].sort((left, right) => left.start - right.start)
  }

  private injectionBlock(document: ParsedDocument, region: FencedRegion): SkillBodyConstruct {
    return this.create(
      document,
      'injection',
      document.body.text.slice(region.start, region.end),
      region.start,
      region.end,
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
