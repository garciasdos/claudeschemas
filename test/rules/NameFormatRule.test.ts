import { describe, expect, it } from 'vitest'
import { NameFormatRule } from '../../src/core/kinds/skill/rules/NameFormatRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new NameFormatRule()

describe('NameFormatRule', () => {
  it('accepts lowercase words joined by single hyphens', () => {
    expect(rule.check(withFrontmatter('name: review-pull-request-2'))).toEqual([])
  })

  it.each(['Review', 'review_request', 'review--request', '-review', 'review-', 'révision'])(
    'rejects %s',
    (name) => {
      const diagnostics = rule.check(withFrontmatter(`name: ${name}`))
      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0]?.ruleId).toBe('skill/name-format')
      expect(diagnostics[0]?.severity).toBe('error')
    },
  )

  it('rejects a name longer than 64 characters', () => {
    const diagnostics = rule.check(withFrontmatter(`name: ${'a'.repeat(65)}`))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.message).toContain('65 characters')
  })

  it('reports both problems when a long name is also malformed', () => {
    const diagnostics = rule.check(withFrontmatter(`name: ${'A'.repeat(65)}`))
    expect(diagnostics).toHaveLength(2)
  })

  it('stays quiet when name is absent or not a string', () => {
    expect(rule.check(withFrontmatter('description: x'))).toEqual([])
    expect(rule.check(withFrontmatter('name: 12'))).toEqual([])
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
