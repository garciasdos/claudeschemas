import { describe, expect, it } from 'vitest'
import { NameSaysSkillRule } from '../../../src/core/kinds/skill/rules/hints/NameSaysSkillRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new NameSaysSkillRule()

describe('NameSaysSkillRule', () => {
  it('hints when the name ends in -skill and suggests the rest', () => {
    const diagnostics = rule.check(withFrontmatter('name: pdf-skill'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0]?.ruleId).toBe('skill/name-says-skill')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.message).toContain('"/pdf" instead of "/pdf-skill"')
    expect(diagnostics[0]?.range.start.line).toBe(2)
  })

  it('catches the word anywhere in the name', () => {
    expect(rule.check(withFrontmatter('name: skill-pdf'))[0]?.message).toContain('"/pdf"')
    expect(rule.check(withFrontmatter('name: my-skills-pdf'))[0]?.message).toContain('"/my-pdf"')
  })

  it('offers no suggestion when nothing would be left', () => {
    expect(rule.check(withFrontmatter('name: skill'))[0]?.message).toContain(
      'Name the skill after what it does instead.',
    )
  })

  it('leaves names that merely contain the letters alone', () => {
    expect(rule.check(withFrontmatter('name: skillet-recipes'))).toEqual([])
    expect(rule.check(withFrontmatter('name: upskill'))).toEqual([])
  })

  it('stays quiet without a name or frontmatter', () => {
    expect(rule.check(withFrontmatter('description: Sorts imports.'))).toEqual([])
    expect(rule.check(parseDocument('Just instructions.\n'))).toEqual([])
  })
})
