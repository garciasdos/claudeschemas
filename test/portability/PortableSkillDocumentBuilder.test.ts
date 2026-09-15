import { describe, expect, it } from 'vitest'
import { MarkdownFrontmatterParser } from '../../src/core/document/MarkdownFrontmatterParser'
import { PortableSkillDocumentBuilder } from '../../src/core/kinds/skill/portability/PortableSkillDocumentBuilder'
import {
  agentSkillsSpecTargetId,
  allTargetsId,
  createSkillTargets,
} from '../../src/core/kinds/skill/targets/createSkillTargets'
import type { SkillPortabilityTarget } from '../../src/core/kinds/skill/targets/types'

const builder = new PortableSkillDocumentBuilder(new MarkdownFrontmatterParser())

const targetsOf = (id: string): readonly SkillPortabilityTarget[] => {
  const selection = createSkillTargets().find((candidate) => candidate.id === id)
  if (selection === undefined) {
    throw new Error(`No target selection named ${id}.`)
  }
  return selection.portabilityTargets
}

const specTargets = targetsOf(agentSkillsSpecTargetId)
const allTargets = targetsOf(allTargetsId)

const document = (...lines: readonly string[]): string => `${lines.join('\n')}\n`

describe('PortableSkillDocumentBuilder', () => {
  it('keeps accepted frontmatter keys in their original order', () => {
    const text = document(
      '---',
      'name: demo',
      'when_to_use: After a pull request is merged.',
      'description: Records a merged pull request.',
      'argument-hint: [issue-number]',
      'license: MIT',
      '---',
      '',
      'Body.',
    )

    const portable = builder.build(text, specTargets)

    expect(portable.text).toBe(
      document(
        '---',
        'name: demo',
        'description: Records a merged pull request.',
        'license: MIT',
        '---',
        '',
        'Body.',
      ),
    )
  })

  it('keeps multi-line values exactly as they were written', () => {
    const text = document(
      '---',
      'name: demo',
      'description: >',
      '  A description that wraps',
      '  over two indented lines.',
      'allowed-tools:',
      '  - Read',
      '  - Bash(git status:*)',
      'arguments:',
      '  - pull-request',
      '---',
      '',
      'Body.',
    )

    const portable = builder.build(text, specTargets)

    expect(portable.text).toBe(
      document(
        '---',
        'name: demo',
        'description: >',
        '  A description that wraps',
        '  over two indented lines.',
        'allowed-tools:',
        '  - Read',
        '  - Bash(git status:*)',
        '---',
        '',
        'Body.',
      ),
    )
  })

  it('drops exactly the unaccepted keys and names them in a note', () => {
    const text = document(
      '---',
      'name: demo',
      'description: Records a merged pull request.',
      'when_to_use: After a pull request is merged.',
      'argument-hint: [issue-number]',
      'arguments:',
      '  - pull-request',
      'allowed-tools:',
      '  - Read',
      '---',
      '',
      'Body.',
    )

    const portable = builder.build(text, specTargets)

    expect(portable.text).toContain('allowed-tools:')
    expect(portable.text).not.toContain('when_to_use')
    expect(portable.text).not.toContain('argument-hint')
    expect(portable.text).not.toContain('pull-request')
    expect(portable.notes).toEqual([
      'Removed 3 frontmatter fields the Agent Skills spec does not accept: `when_to_use`, `argument-hint`, `arguments`.',
    ])
  })

  it('keeps comments and quoted keys that belong to an accepted field', () => {
    const text = document(
      '---',
      '# the skill folder name',
      'name: demo',
      '"description": Records a merged pull request.',
      'model: inherit',
      '---',
      '',
      'Body.',
    )

    const portable = builder.build(text, specTargets)

    expect(portable.text).toContain('# the skill folder name')
    expect(portable.text).toContain('"description": Records a merged pull request.')
    expect(portable.text).not.toContain('model: inherit')
  })

  it('removes inline and fenced dynamic context injections but not fenced sample code', () => {
    const text = document(
      '---',
      'name: demo',
      '---',
      '',
      'Check the tree: !`git status`',
      '',
      '```!',
      'git diff --stat',
      '```',
      '',
      'Sample:',
      '',
      '```sh',
      '!`git status`',
      '```',
      '',
      'Done.',
    )

    const portable = builder.build(text, specTargets)

    expect(portable.text).toContain('Check the tree:\n')
    expect(portable.text).not.toContain('Check the tree: !')
    expect(portable.text).not.toContain('```!')
    expect(portable.text).not.toContain('git diff --stat')
    expect(portable.text).toContain('```sh\n!`git status`\n```')
    expect(portable.notes).toEqual([
      'Removed 2 dynamic context injections (lines 5 and 7). Write out the information those commands produced.',
    ])
  })

  it('removes a line that holds nothing but an injection', () => {
    const text = document('---', 'name: demo', '---', '', 'Before.', '!`git status`', 'After.')

    const portable = builder.build(text, specTargets)

    expect(portable.text).toBe(document('---', 'name: demo', '---', '', 'Before.', 'After.'))
    expect(portable.notes).toEqual([
      'Removed 1 dynamic context injection (line 6). Write out the information that command produced.',
    ])
  })

  it('leaves argument and variable substitutions in place and names their lines', () => {
    const text = document(
      '---',
      'name: demo',
      '---',
      '',
      'Work on $ARGUMENTS.',
      '',
      'Read ${CLAUDE_SKILL_DIR}/reference.md first.',
    )

    const portable = builder.build(text, specTargets)

    expect(portable.text).toContain('Work on $ARGUMENTS.')
    expect(portable.text).toContain('Read ${CLAUDE_SKILL_DIR}/reference.md first.')
    expect(portable.notes).toEqual([
      'Left in place, rewrite by hand: `$ARGUMENTS` on line 5 is never substituted outside Claude Code, so the literal text reaches the model.',
      'Left in place, rewrite by hand: `${CLAUDE_SKILL_DIR}` on line 7 is never substituted outside Claude Code, so the literal text reaches the model.',
    ])
  })

  it('groups one placeholder that appears on several lines into a single note', () => {
    const text = document(
      '---',
      'name: demo',
      'arguments:',
      '  - pull-request',
      '---',
      '',
      'Read pull request $pull-request.',
      '',
      'Then summarise $pull-request.',
    )

    const portable = builder.build(text, specTargets)

    expect(portable.notes).toEqual([
      'Removed 1 frontmatter field the Agent Skills spec does not accept: `arguments`.',
      'Left in place, rewrite by hand: `$pull-request` on lines 7 and 9 is never substituted outside Claude Code, so the literal text reaches the model.',
    ])
  })

  it('never touches the text it was given and returns a new document', () => {
    const text = document('---', 'name: demo', 'when_to_use: Later.', '---', '', 'Body.')

    const portable = builder.build(text, specTargets)

    expect(text).toBe('---\nname: demo\nwhen_to_use: Later.\n---\n\nBody.\n')
    expect(portable.text).not.toBe(text)
  })

  it('returns an already portable document unchanged', () => {
    const text = document(
      '---',
      'name: demo',
      'description: Records a merged pull request.',
      '---',
      '',
      'Body.',
    )

    const portable = builder.build(text, specTargets)

    expect(portable.text).toBe(text)
    expect(portable.notes).toEqual([
      'Nothing had to be removed: this document is already portable.',
    ])
  })

  it('treats two targets that accept the same fields as one, naming both in the note', () => {
    const text = document(
      '---',
      'name: demo',
      'when_to_use: After a pull request is merged.',
      'argument-hint: [issue-number]',
      '---',
      '',
      'Body.',
    )

    const portable = builder.build(text, allTargets)

    expect(portable.text).toBe(builder.build(text, specTargets).text)
    expect(portable.notes).toEqual([
      'Removed 2 frontmatter fields that claude.ai / Skills API and the Agent Skills spec do not accept: `when_to_use`, `argument-hint`.',
    ])
  })

  it('names both places when two targets are asked for at once', () => {
    const text = document('---', 'name: demo', '---', '', 'Work on $ARGUMENTS.')

    const portable = builder.build(text, allTargets)

    expect(portable.notes).toEqual([
      'Left in place, rewrite by hand: `$ARGUMENTS` on line 5 is never substituted outside Claude Code, so the literal text reaches the model.',
    ])
  })

  it('says so when there is no frontmatter to filter', () => {
    const text = document('# Demo', '', 'Body.')

    const portable = builder.build(text, specTargets)

    expect(portable.text).toBe(text)
    expect(portable.notes).toEqual([
      'This document has no frontmatter, so there were no fields to remove.',
    ])
  })

  it('leaves invalid frontmatter untouched and says why', () => {
    const text = document('---', 'name: demo', '  bad: indent', '---', '', 'Body.')

    const portable = builder.build(text, specTargets)

    expect(portable.text).toBe(text)
    expect(portable.notes).toEqual([
      'Left the frontmatter untouched: it is not valid YAML, so its fields could not be filtered. Fix the YAML error first, then convert again.',
    ])
  })

  it('leaves an unterminated frontmatter block untouched', () => {
    const text = document('---', 'name: demo', '', 'Body.')

    const portable = builder.build(text, specTargets)

    expect(portable.text).toBe(text)
    expect(portable.notes).toEqual([
      'Left the frontmatter untouched: it is not valid YAML, so its fields could not be filtered. Fix the YAML error first, then convert again.',
    ])
  })
})
