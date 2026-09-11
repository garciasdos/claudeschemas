import { describe, expect, it } from 'vitest'
import { MissingDescriptionRule } from '../../src/core/kinds/skill/rules/MissingDescriptionRule'
import { parseDocument, withFrontmatter } from '../support/parseDocument'

const rule = new MissingDescriptionRule()

describe('MissingDescriptionRule', () => {
  it('warns when description is absent', () => {
    const diagnostics = rule.check(withFrontmatter('name: demo'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/missing-description')
    expect(diagnostics[0]?.severity).toBe('warning')
    expect(diagnostics[0]?.message).toContain('first non-empty line')
  })

  it('warns when description is blank and points at it', () => {
    const diagnostics = rule.check(withFrontmatter("name: demo\ndescription: '   '"))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.range.start.line).toBe(3)
  })

  it('points at the name line when description is absent', () => {
    expect(rule.check(withFrontmatter('name: demo'))[0]?.range.start.line).toBe(2)
  })

  it('accepts a written description', () => {
    expect(rule.check(withFrontmatter('description: Does a thing.'))).toEqual([])
  })

  it('stays quiet without frontmatter, where the whole file is the instruction', () => {
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
