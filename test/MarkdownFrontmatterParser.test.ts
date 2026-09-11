import { describe, expect, it } from 'vitest'
import { MarkdownFrontmatterParser } from '../src/core/document/MarkdownFrontmatterParser'

const parser = new MarkdownFrontmatterParser()

describe('MarkdownFrontmatterParser', () => {
  it('treats the whole file as body when the first line is not a delimiter', () => {
    const document = parser.parse('# Title\n\n---\nname: late\n---\n')
    expect(document.frontmatter).toBeNull()
    expect(document.body.text).toBe('# Title\n\n---\nname: late\n---\n')
    expect(document.body.range.start).toEqual({ line: 1, column: 1 })
  })

  it('treats an empty file as an empty body', () => {
    const document = parser.parse('')
    expect(document.frontmatter).toBeNull()
    expect(document.body.range).toEqual({
      start: { line: 1, column: 1 },
      end: { line: 1, column: 1 },
    })
  })

  it('splits frontmatter from body and parses the YAML', () => {
    const document = parser.parse('---\nname: demo\n---\n\nBody line.\n')
    expect(document.frontmatter?.data).toEqual({ name: 'demo' })
    expect(document.frontmatter?.raw).toBe('name: demo')
    expect(document.frontmatter?.range).toEqual({
      start: { line: 1, column: 1 },
      end: { line: 3, column: 4 },
    })
    expect(document.body.text).toBe('\nBody line.\n')
    expect(document.body.range.start).toEqual({ line: 4, column: 1 })
  })

  it('reports an unterminated frontmatter block', () => {
    const document = parser.parse('---\nname: demo\n\nBody line.\n')
    expect(document.frontmatter?.parseError?.message).toContain('never closed')
    expect(document.frontmatter?.parseError?.range.start).toEqual({ line: 1, column: 1 })
    expect(document.body.text).toBe('')
  })

  it('reports a YAML syntax error with a range inside the frontmatter', () => {
    const document = parser.parse('---\nname: demo\n  bad: indent\n---\n\nBody.\n')
    expect(document.frontmatter?.parseError).toBeDefined()
    expect(document.frontmatter?.parseError?.range.start.line).toBe(3)
  })

  it('keeps an empty body positioned after the closing delimiter', () => {
    const document = parser.parse('---\nname: demo\n---')
    expect(document.body.text).toBe('')
    expect(document.body.range.start).toEqual({ line: 3, column: 4 })
  })

  it('handles carriage returns', () => {
    const document = parser.parse('---\r\nname: demo\r\n---\r\n\r\nBody.\r\n')
    expect(document.frontmatter?.data).toEqual({ name: 'demo' })
    expect(document.body.range.start.line).toBe(4)
  })

  it('exposes an empty frontmatter block as undefined data', () => {
    const document = parser.parse('---\n---\nBody.\n')
    expect(document.frontmatter?.data).toBeUndefined()
    expect(document.frontmatter?.parseError).toBeUndefined()
  })
})
