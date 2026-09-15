import { describe, expect, it } from 'vitest'
import { createSkillDocumentKind } from '../src/core/kinds/skill/createSkillDocumentKind'
import type { Diagnostic } from '../src/core/diagnostics/types'

interface ProblemExpectation {
  problem: string
  ruleIds: string[]
}

interface HintExpectation {
  hint: string
  ruleIds: string[]
}

interface PortabilityExpectation {
  problem: string
  targets: Record<string, string[]>
}

const kind = createSkillDocumentKind()

const validFixtures = import.meta.glob<string>('./fixtures/skills/valid/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const invalidFixtures = import.meta.glob<string>('./fixtures/skills/invalid/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const hintFixtures = import.meta.glob<string>('./fixtures/skills/hints/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const portabilityFixtures = import.meta.glob<string>('./fixtures/skills/portability/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const problemExpectations = import.meta.glob<ProblemExpectation>(
  './fixtures/skills/invalid/*.expected.json',
  { import: 'default', eager: true },
)

const hintExpectations = import.meta.glob<HintExpectation>(
  './fixtures/skills/hints/*.expected.json',
  { import: 'default', eager: true },
)

const portabilityExpectations = import.meta.glob<PortabilityExpectation>(
  './fixtures/skills/portability/*.expected.json',
  { import: 'default', eager: true },
)

const targetIds = ['claude-code', 'skills-api', 'agent-skills-spec', 'all']

const nameOf = (path: string): string => path.slice(path.lastIndexOf('/') + 1)

const expectationPathOf = (path: string): string => path.replace(/\.md$/, '.expected.json')

const isHint = (diagnostic: Diagnostic): boolean => diagnostic.severity === 'hint'

const ruleIdsOf = (diagnostics: readonly Diagnostic[]): string[] =>
  Array.from(new Set(diagnostics.map((diagnostic) => diagnostic.ruleId))).sort()

const isPortability = (diagnostic: Diagnostic): boolean =>
  diagnostic.ruleId.startsWith('portability/')

const portabilityCases = (): [string, string, string, string][] =>
  Object.entries(portabilityFixtures).flatMap(([path, text]) =>
    targetIds.map((targetId): [string, string, string, string] => [
      `${nameOf(path)} on ${targetId}`,
      path,
      text,
      targetId,
    ]),
  )

describe('valid skill fixtures', () => {
  it('covers several field combinations', () => {
    expect(Object.keys(validFixtures).length).toBeGreaterThanOrEqual(6)
  })

  it.each(Object.entries(validFixtures))('%s reports no errors', (_path, text) => {
    const errors = kind.validate(text).filter((diagnostic) => diagnostic.severity === 'error')
    expect(errors).toEqual([])
  })

  it.each(Object.entries(validFixtures))('%s reports nothing at all', (_path, text) => {
    expect(kind.validate(text)).toEqual([])
  })

  it.each(Object.entries(validFixtures))(
    '%s reports nothing on the claude-code target',
    (_path, text) => {
      expect(kind.validate(text, 'claude-code')).toEqual([])
    },
  )
})

describe('invalid skill fixtures', () => {
  it('covers several distinct problems', () => {
    expect(Object.keys(invalidFixtures).length).toBeGreaterThanOrEqual(8)
  })

  it.each(Object.entries(invalidFixtures))('%s reports the expected rules', (path, text) => {
    const expectation = problemExpectations[expectationPathOf(path)]
    expect(expectation, `missing .expected.json for ${nameOf(path)}`).toBeDefined()
    const problems = kind.validate(text).filter((diagnostic) => !isHint(diagnostic))
    expect(ruleIdsOf(problems)).toEqual([...(expectation?.ruleIds ?? [])].sort())
  })

  it.each(Object.entries(invalidFixtures))('%s points at a real line', (_path, text) => {
    for (const diagnostic of kind.validate(text)) {
      expect(diagnostic.range.start.line).toBeGreaterThanOrEqual(1)
      expect(diagnostic.range.end.line).toBeGreaterThanOrEqual(diagnostic.range.start.line)
    }
  })
})

describe('hint skill fixtures', () => {
  it('covers every hint rule', () => {
    expect(Object.keys(hintFixtures).length).toBeGreaterThanOrEqual(10)
  })

  it.each(Object.entries(hintFixtures))('%s reports only the expected hints', (path, text) => {
    const expectation = hintExpectations[expectationPathOf(path)]
    expect(expectation, `missing .expected.json for ${nameOf(path)}`).toBeDefined()
    const diagnostics = kind.validate(text)
    expect(diagnostics.filter((diagnostic) => !isHint(diagnostic))).toEqual([])
    expect(ruleIdsOf(diagnostics)).toEqual([...(expectation?.ruleIds ?? [])].sort())
  })

  it.each(Object.entries(hintFixtures))('%s points at a real line', (_path, text) => {
    for (const diagnostic of kind.validate(text)) {
      expect(diagnostic.range.start.line).toBeGreaterThanOrEqual(1)
      expect(diagnostic.range.end.line).toBeGreaterThanOrEqual(diagnostic.range.start.line)
    }
  })
})

describe('portability skill fixtures', () => {
  it('covers every portability rule', () => {
    expect(Object.keys(portabilityFixtures).length).toBeGreaterThanOrEqual(8)
  })

  it.each(Object.entries(portabilityFixtures))('%s expects every target', (path) => {
    const expectation = portabilityExpectations[expectationPathOf(path)]
    expect(expectation, `missing .expected.json for ${nameOf(path)}`).toBeDefined()
    expect(Object.keys(expectation?.targets ?? {}).sort()).toEqual([...targetIds].sort())
  })

  it.each(portabilityCases())(
    '%s reports the expected portability rules',
    (_label, path, text, targetId) => {
      const expectation = portabilityExpectations[expectationPathOf(path)]
      const findings = kind.validate(text, targetId).filter(isPortability)
      expect(ruleIdsOf(findings)).toEqual([...(expectation?.targets[targetId] ?? [])].sort())
    },
  )

  it.each(portabilityCases())('%s points at a real line', (_label, _path, text, targetId) => {
    for (const diagnostic of kind.validate(text, targetId)) {
      expect(diagnostic.range.start.line).toBeGreaterThanOrEqual(1)
      expect(diagnostic.range.end.line).toBeGreaterThanOrEqual(diagnostic.range.start.line)
    }
  })

  it.each(portabilityCases())(
    '%s attributes every finding to at least one target',
    (_label, _path, text, targetId) => {
      for (const diagnostic of kind.validate(text, targetId)) {
        if (diagnostic.portability === undefined) {
          continue
        }
        expect(diagnostic.portability.targets.length).toBeGreaterThan(0)
      }
    },
  )

  it('merges a finding that affects both targets into one', () => {
    const findings = Object.values(portabilityFixtures).flatMap((text) =>
      kind.validate(text, 'all').filter(isPortability),
    )
    const merged = findings.filter(
      (diagnostic) =>
        (diagnostic.portability?.targets ?? []).includes('skills-api') &&
        (diagnostic.portability?.targets ?? []).includes('agent-skills-spec'),
    )
    expect(merged.length).toBeGreaterThan(0)
  })

  it.each(Object.entries(portabilityFixtures))(
    '%s validates as claude-code without a target',
    (_path, text) => {
      expect(kind.validate(text)).toEqual(kind.validate(text, 'claude-code'))
    },
  )

  it.each(targetIds)('spec-only.md reports no problems and no hints on %s', (targetId) => {
    const text = portabilityFixtures['./fixtures/skills/portability/spec-only.md']
    expect(text, 'missing spec-only.md').toBeDefined()
    expect(kind.validate(text ?? '', targetId)).toEqual([])
  })
})
