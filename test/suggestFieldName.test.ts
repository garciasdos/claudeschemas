import { describe, expect, it } from 'vitest'
import { suggestFieldName } from '../src/core/schema/suggestFieldName'

const known = ['name', 'description', 'when_to_use', 'argument-hint', 'allowed-tools', 'model']

describe('suggestFieldName', () => {
  it('matches a field that differs only in case', () => {
    expect(suggestFieldName('Description', known)).toBe('description')
  })

  it('matches a field written with underscores or camel case', () => {
    expect(suggestFieldName('allowed_tools', known)).toBe('allowed-tools')
    expect(suggestFieldName('argumentHint', known)).toBe('argument-hint')
    expect(suggestFieldName('when-to-use', known)).toBe('when_to_use')
  })

  it('matches a small typo', () => {
    expect(suggestFieldName('descripton', known)).toBe('description')
    expect(suggestFieldName('argument-hints', known)).toBe('argument-hint')
  })

  it('returns null when nothing is close', () => {
    expect(suggestFieldName('author', known)).toBeNull()
    expect(suggestFieldName('x', known)).toBeNull()
  })
})
