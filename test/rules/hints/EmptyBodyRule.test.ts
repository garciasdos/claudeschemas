import { describe, expect, it } from 'vitest'
import { EmptyBodyRule } from '../../../src/core/kinds/skill/rules/hints/EmptyBodyRule'
import { parseDocument } from '../../support/parseDocument'

const rule = new EmptyBodyRule()

describe('EmptyBodyRule', () => {
  it('hints when nothing follows the frontmatter', () => {
    const diagnostics = rule.check(parseDocument('---\nname: demo\n---\n'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/empty-body')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.source).toBe('body')
    expect(diagnostics[0]?.range).toEqual({
      start: { line: 3, column: 1 },
      end: { line: 3, column: 4 },
    })
  })

  it('treats a whitespace-only body as empty', () => {
    expect(rule.check(parseDocument('---\nname: demo\n---\n\n   \n'))).toHaveLength(1)
  })

  it('stays quiet once the body has content', () => {
    expect(rule.check(parseDocument('---\nname: demo\n---\n\nDo it.\n'))).toEqual([])
  })

  it('leaves an unterminated frontmatter block to the YAML diagnostic', () => {
    expect(rule.check(parseDocument('---\nname: demo\n'))).toEqual([])
  })

  it('stays quiet without frontmatter', () => {
    expect(rule.check(parseDocument(''))).toEqual([])
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
