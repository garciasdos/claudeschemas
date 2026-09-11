import { describe, expect, it } from 'vitest'
import { PlaceholderTextRule } from '../../../src/core/kinds/skill/rules/hints/PlaceholderTextRule'
import { parseDocument, withFrontmatter } from '../../support/parseDocument'

const rule = new PlaceholderTextRule()

describe('PlaceholderTextRule', () => {
  it('hints at each placeholder word in the body', () => {
    const diagnostics = rule.check(
      withFrontmatter('name: demo', 'Step one.\nTODO write step two.\nStep three is TBD.\n'),
    )
    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0]?.ruleId).toBe('skill/placeholder-text')
    expect(diagnostics[0]?.severity).toBe('hint')
    expect(diagnostics[0]?.source).toBe('body')
    expect(diagnostics[0]?.message).toContain('"TODO" reads as a placeholder')
    expect(diagnostics[0]?.range).toEqual({
      start: { line: 6, column: 1 },
      end: { line: 6, column: 5 },
    })
    expect(diagnostics[1]?.message).toContain('"TBD"')
  })

  it('catches bracketed template placeholders and lorem ipsum', () => {
    expect(rule.check(parseDocument('Read [insert file name here].\n'))).toHaveLength(1)
    expect(rule.check(parseDocument('Then <describe the output>.\n'))).toHaveLength(1)
    expect(rule.check(parseDocument('Lorem ipsum dolor sit amet.\n'))).toHaveLength(1)
  })

  it('leaves ordinary words and lowercase todo alone', () => {
    expect(rule.check(parseDocument('Count the todos and report them.\n'))).toEqual([])
    expect(rule.check(parseDocument('Fix the TODOs in the file.\n'))).toEqual([])
  })

  it('only scans the body', () => {
    expect(rule.check(withFrontmatter('description: TODO', 'Do it.\n'))).toEqual([])
  })
})
