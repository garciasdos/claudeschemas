import type { Range } from '../diagnostics/types'
import type { Frontmatter } from './types'
import { lineRange } from './positions'

const topLevelKeyPattern = /^(?:"([^"]*)"|'([^']*)'|([^\s:#[\]{},&*!|>%@`-][^:#]*?))\s*:(?:\s|$)/

export interface KeyRangeLocator {
  rangeFor(path: readonly (string | number)[]): Range | null
}

const readKey = (line: string): string | null => {
  const match = topLevelKeyPattern.exec(line)
  if (match === null) {
    return null
  }
  const key = match[1] ?? match[2] ?? match[3]
  return key === undefined ? null : key.trim()
}

const collectKeyRanges = (frontmatter: Frontmatter): Map<string, Range> => {
  const ranges = new Map<string, Range>()
  const firstContentLine = frontmatter.range.start.line + 1
  frontmatter.raw.split('\n').forEach((line, index) => {
    const key = readKey(line)
    if (key === null || ranges.has(key)) {
      return
    }
    ranges.set(key, lineRange(firstContentLine + index, line.length))
  })
  return ranges
}

export class FrontmatterKeyLocator implements KeyRangeLocator {
  private readonly keyRanges: ReadonlyMap<string, Range>

  constructor(frontmatter: Frontmatter) {
    this.keyRanges = collectKeyRanges(frontmatter)
  }

  rangeFor(path: readonly (string | number)[]): Range | null {
    const head = path[0]
    if (head === undefined) {
      return null
    }
    return this.keyRanges.get(String(head)) ?? null
  }
}
