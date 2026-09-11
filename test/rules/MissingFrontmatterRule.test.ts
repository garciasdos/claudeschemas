import { describe, expect, it } from 'vitest'
import { MissingFrontmatterRule } from '../../src/core/kinds/skill/rules/MissingFrontmatterRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new MissingFrontmatterRule()

describe('MissingFrontmatterRule', () => {
  it('reports an info diagnostic on the first line', () => {
    const diagnostics = rule.check(parseDocument('# Notes\n\nDo the thing.\n'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/no-frontmatter')
    expect(diagnostics[0]?.severity).toBe('info')
    expect(diagnostics[0]?.range).toEqual({
      start: { line: 1, column: 1 },
      end: { line: 1, column: 8 },
    })
  })

  it('stays quiet when frontmatter is present', () => {
    expect(rule.check(withFrontmatter('name: demo'))).toEqual([])
  })

  it('stays quiet when frontmatter is present but broken', () => {
    expect(rule.check(parseDocument('---\nname: [\n---\n'))).toEqual([])
  })

  it('reports a file whose delimiter is not on the first line', () => {
    expect(rule.check(parseDocument('\n---\nname: demo\n---\n'))).toHaveLength(1)
  })
})
