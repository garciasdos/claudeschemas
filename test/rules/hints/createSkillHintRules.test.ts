import { describe, expect, it } from 'vitest'
import { createSkillHintRules } from '../../../src/core/kinds/skill/rules/hints/createSkillHintRules'
import { createSkillRules } from '../../../src/core/kinds/skill/rules/createSkillRules'

describe('createSkillHintRules', () => {
  it('only produces hint rules with unique skill ids', () => {
    const rules = createSkillHintRules()
    expect(rules.length).toBeGreaterThanOrEqual(10)
    for (const rule of rules) {
      expect(rule.severity).toBe('hint')
      expect(rule.id).toMatch(/^skill\/[a-z0-9-]+$/)
    }
    expect(new Set(rules.map((rule) => rule.id)).size).toBe(rules.length)
  })

  it('is included after the validation rules of the skill kind', () => {
    const ids = createSkillRules().map((rule) => rule.id)
    const hintIds = createSkillHintRules().map((rule) => rule.id)
    expect(ids.slice(-hintIds.length)).toEqual(hintIds)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
