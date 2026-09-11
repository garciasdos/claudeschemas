import { describe, expect, it } from 'vitest'
import { FrontmatterKeyLocator } from '../src/core/document/FrontmatterKeyLocator'
import { parseDocument } from './support/parseDocument'

const locatorFor = (text: string): FrontmatterKeyLocator => {
  const frontmatter = parseDocument(text).frontmatter
  if (frontmatter === null) {
    throw new Error('expected frontmatter')
  }
  return new FrontmatterKeyLocator(frontmatter)
}

describe('FrontmatterKeyLocator', () => {
  it('maps a top-level key to its line', () => {
    const locator = locatorFor('---\nname: demo\neffort: high\n---\n')
    expect(locator.rangeFor(['effort'])).toEqual({
      start: { line: 3, column: 1 },
      end: { line: 3, column: 13 },
    })
  })

  it('maps a nested path to the top-level key that owns it', () => {
    const locator = locatorFor('---\nhooks:\n  Stop:\n    - matcher: a\n---\n')
    expect(locator.rangeFor(['hooks', 'Stop', 0])).toEqual({
      start: { line: 2, column: 1 },
      end: { line: 2, column: 7 },
    })
  })

  it('ignores indented keys and list entries', () => {
    const locator = locatorFor('---\nallowed-tools:\n  - Read\n---\n')
    expect(locator.rangeFor(['Read'])).toBeNull()
    expect(locator.rangeFor(['allowed-tools'])?.start.line).toBe(2)
  })

  it('reads quoted keys', () => {
    const locator = locatorFor('---\n"when_to_use": later\n---\n')
    expect(locator.rangeFor(['when_to_use'])?.start.line).toBe(2)
  })

  it('returns null for an unknown key and for an empty path', () => {
    const locator = locatorFor('---\nname: demo\n---\n')
    expect(locator.rangeFor(['missing'])).toBeNull()
    expect(locator.rangeFor([])).toBeNull()
  })
})
