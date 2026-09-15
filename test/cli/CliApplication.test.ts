import { describe, expect, it } from 'vitest'
import { createDefaultRegistry, skillSample } from '../../src/core'
import { CliApplication } from '../../src/cli/CliApplication'
import { createReportFormatter } from '../../src/cli/createReportFormatter'
import { DocumentValidationService } from '../../src/cli/DocumentValidationService'
import type {
  CliOutput,
  DocumentSource,
  DocumentSourceReader,
  ValidationReport,
} from '../../src/cli/types'

class StubSourceReader implements DocumentSourceReader {
  constructor(private readonly sources: readonly DocumentSource[]) {}

  read(): Promise<readonly DocumentSource[]> {
    return Promise.resolve(this.sources)
  }
}

class FailingSourceReader implements DocumentSourceReader {
  read(): Promise<readonly DocumentSource[]> {
    return Promise.reject(new Error('ENOENT: no such file or directory'))
  }
}

class RecordingOutput implements CliOutput {
  readonly lines: string[] = []
  readonly errors: string[] = []

  write(line: string): void {
    this.lines.push(line)
  }

  writeError(line: string): void {
    this.errors.push(line)
  }
}

const hintingSkill = `---
name: demo
description: Does things.
---

Do them.
`

const invalidSkill = `---
name: Demo Skill
---

Body.
`

const run = async (argv: readonly string[], sources: readonly DocumentSource[]) => {
  const output = new RecordingOutput()
  const application = new CliApplication(
    new DocumentValidationService(createDefaultRegistry()),
    new StubSourceReader(sources),
    createReportFormatter,
    output,
  )
  const exitCode = await application.run(argv)
  return { exitCode, output }
}

describe('CliApplication', () => {
  it('reports a clean file with the exit code zero', async () => {
    const { exitCode, output } = await run([], [{ name: 'SKILL.md', text: skillSample }])
    expect(exitCode).toBe(0)
    expect(output.lines).toEqual(['SKILL.md: no problems, 0 hints (claude-code)'])
    expect(output.errors).toEqual([])
  })

  it('lists hints without failing, since a hint is not a problem', async () => {
    const { exitCode, output } = await run([], [{ name: 'SKILL.md', text: hintingSkill }])
    expect(exitCode).toBe(0)
    expect(output.lines.some((line) => line.includes(': hint: skill/'))).toBe(true)
  })

  it('fails on hints under --strict', async () => {
    const { exitCode } = await run(['--strict'], [{ name: 'SKILL.md', text: hintingSkill }])
    expect(exitCode).toBe(1)
  })

  it('fails when a problem is reported', async () => {
    const { exitCode, output } = await run([], [{ name: 'SKILL.md', text: invalidSkill }])
    expect(exitCode).toBe(1)
    expect(output.lines.some((line) => line.includes('skill/name-format'))).toBe(true)
  })

  it('reports portability problems against another target', async () => {
    const { exitCode, output } = await run(
      ['--target', 'skills-api'],
      [{ name: 'SKILL.md', text: skillSample }],
    )
    expect(exitCode).toBe(1)
    expect(output.lines.some((line) => line.includes('(affects skills-api)'))).toBe(true)
  })

  it('emits a parsable report under --json', async () => {
    const { output } = await run(['--json'], [{ name: 'SKILL.md', text: hintingSkill }])
    const report = JSON.parse(output.lines.join('\n')) as ValidationReport
    expect(report.kind).toBe('skill')
    expect(report.target).toBe('claude-code')
    expect(report.results).toHaveLength(1)
    expect(report.results[0].file).toBe('SKILL.md')
    expect(report.results[0].hints.length).toBeGreaterThan(0)
    expect(report.results[0].counts.hint).toBe(report.results[0].hints.length)
  })

  it('rejects an unknown kind with the usage exit code', async () => {
    const { exitCode, output } = await run(
      ['--kind', 'recipe'],
      [{ name: 'SKILL.md', text: skillSample }],
    )
    expect(exitCode).toBe(2)
    expect(output.errors[0]).toContain('Unknown document kind "recipe"')
  })

  it('rejects an unknown target with the usage exit code', async () => {
    const { exitCode, output } = await run(
      ['--target', 'gemini'],
      [{ name: 'SKILL.md', text: skillSample }],
    )
    expect(exitCode).toBe(2)
    expect(output.errors[0]).toContain('Unknown target "gemini"')
  })

  it('rejects an unknown option before reading anything', async () => {
    const { exitCode, output } = await run(['--verbose'], [])
    expect(exitCode).toBe(2)
    expect(output.errors[0]).toBe('Unknown option --verbose.')
  })

  it('reports an unreadable file with the usage exit code', async () => {
    const output = new RecordingOutput()
    const application = new CliApplication(
      new DocumentValidationService(createDefaultRegistry()),
      new FailingSourceReader(),
      createReportFormatter,
      output,
    )
    expect(await application.run(['missing/SKILL.md'])).toBe(2)
    expect(output.errors[0]).toContain('ENOENT')
  })

  it('prints the usage for --help', async () => {
    const { exitCode, output } = await run(['--help'], [])
    expect(exitCode).toBe(0)
    expect(output.lines[0]).toContain('Usage: node cli.mjs')
  })

  it('lists the kinds and their targets', async () => {
    const { exitCode, output } = await run(['--list-targets'], [])
    expect(exitCode).toBe(0)
    expect(output.lines[0]).toBe('skill')
    expect(
      output.lines.some((line) => line.includes('claude-code') && line.includes('(default)')),
    ).toBe(true)
  })
})
