import type { Range } from '../../diagnostics/types'
import type { ParsedDocument } from '../../document/types'
import { FrontmatterKeyLocator } from '../../document/FrontmatterKeyLocator'
import type { KeyRangeLocator } from '../../document/FrontmatterKeyLocator'

const truthyWords = new Set(['true', 'yes', 'on'])
const falsyWords = new Set(['false', 'no', 'off'])

export class SkillFrontmatter {
  static from(document: ParsedDocument): SkillFrontmatter | null {
    const frontmatter = document.frontmatter
    if (frontmatter === null || frontmatter.parseError !== undefined) {
      return null
    }
    const data = frontmatter.data
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return null
    }
    return new SkillFrontmatter(
      data as Record<string, unknown>,
      new FrontmatterKeyLocator(frontmatter),
      frontmatter.range,
    )
  }

  private constructor(
    private readonly data: Record<string, unknown>,
    private readonly locator: KeyRangeLocator,
    private readonly blockRange: Range,
  ) {}

  has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.data, key)
  }

  raw(key: string): unknown {
    return this.data[key]
  }

  string(key: string): string | null {
    const value = this.data[key]
    return typeof value === 'string' ? value : null
  }

  list(key: string): string[] | null {
    const value = this.data[key]
    if (typeof value === 'string') {
      return value.split(/[\s,]+/).filter((entry) => entry.length > 0)
    }
    if (Array.isArray(value)) {
      return value.filter((entry): entry is string => typeof entry === 'string')
    }
    return null
  }

  boolean(key: string): boolean | null {
    const value = this.data[key]
    if (typeof value === 'boolean') {
      return value
    }
    if (typeof value === 'number') {
      if (value === 1) {
        return true
      }
      return value === 0 ? false : null
    }
    if (typeof value === 'string') {
      const word = value.toLowerCase()
      if (truthyWords.has(word)) {
        return true
      }
      return falsyWords.has(word) ? false : null
    }
    return null
  }

  range(key: string): Range {
    return this.locator.rangeFor([key]) ?? this.blockRange
  }
}
