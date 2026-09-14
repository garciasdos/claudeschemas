import type { DocumentParser, ParsedDocument } from '../../../document/types'
import type { PortableDocument } from '../../types'
import { SkillFrontmatter } from '../SkillFrontmatter'
import type { SkillPortabilityTarget } from '../targets/types'
import type { SkillBodyConstruct } from './bodyConstructs'
import { SkillBodyConstructScanner } from './bodyConstructs'

export type SkillBodyConstructScannerFactory = (
  argumentNames: readonly string[],
) => SkillBodyConstructScanner

interface FrontmatterBlock {
  key: string | null
  lines: string[]
}

interface KeyedFrontmatterBlock extends FrontmatterBlock {
  key: string
}

interface FrontmatterSection {
  readonly lines: readonly string[]
  readonly notes: readonly string[]
}

interface BodySection {
  readonly text: string
  readonly notes: readonly string[]
}

const frontmatterDelimiter = /^---[ \t]*$/
const topLevelKey = /^(?![\s#-])("[^"]*"|'[^']*'|[^:\n]+?)[ \t]*:(?=[ \t]|$)/
const surroundingQuotes = /^(["'])(.*)\1$/
const trailingBlanks = /[ \t]+$/

const noFrontmatterNote = 'This document has no frontmatter, so there were no fields to remove.'
const invalidYamlNote =
  'Left the frontmatter untouched: it is not valid YAML, so its fields could not be filtered. Fix the YAML error first, then convert again.'
const alreadyPortableNote = 'Nothing had to be removed: this document is already portable.'

const joinWith = (items: readonly string[], conjunction: string): string => {
  if (items.length <= 1) {
    return items[0] ?? ''
  }
  return `${items.slice(0, -1).join(', ')} ${conjunction} ${items[items.length - 1] ?? ''}`
}

const withArticle = (label: string): string => (/^[A-Z]/.test(label) ? `the ${label}` : label)

const describeLines = (lineNumbers: readonly number[]): string =>
  lineNumbers.length === 1
    ? `line ${lineNumbers[0]}`
    : `lines ${joinWith(lineNumbers.map(String), 'and')}`

const describeFields = (keys: readonly string[]): string =>
  keys.map((key) => `\`${key}\``).join(', ')

const readTopLevelKey = (line: string): string | null => {
  const match = topLevelKey.exec(line)
  const key = match?.[1]
  return key === undefined ? null : key.replace(surroundingQuotes, '$2')
}

const splitIntoBlocks = (rawLines: readonly string[]): FrontmatterBlock[] => {
  const blocks: FrontmatterBlock[] = []
  for (const line of rawLines) {
    const key = readTopLevelKey(line)
    const current = blocks[blocks.length - 1]
    if (key !== null || current === undefined) {
      blocks.push({ key, lines: [line] })
      continue
    }
    current.lines.push(line)
  }
  return blocks
}

export class PortableSkillDocumentBuilder {
  constructor(
    private readonly parser: DocumentParser,
    private readonly createScanner: SkillBodyConstructScannerFactory = (argumentNames) =>
      new SkillBodyConstructScanner(argumentNames),
  ) {}

  build(text: string, targets: readonly SkillPortabilityTarget[]): PortableDocument {
    const document = this.parser.parse(text)
    const frontmatter = this.portableFrontmatter(document, targets)
    const body = this.portableBody(document, targets)
    const notes = [...frontmatter.notes, ...body.notes]
    return {
      text: this.assemble(document, frontmatter.lines, body.text),
      notes: notes.length === 0 ? [alreadyPortableNote] : notes,
    }
  }

  private portableFrontmatter(
    document: ParsedDocument,
    targets: readonly SkillPortabilityTarget[],
  ): FrontmatterSection {
    const frontmatter = document.frontmatter
    if (frontmatter === null) {
      return { lines: [], notes: [noFrontmatterNote] }
    }
    const rawLines = frontmatter.raw === '' ? [] : frontmatter.raw.split('\n')
    if (frontmatter.parseError !== undefined) {
      return { lines: rawLines, notes: [invalidYamlNote] }
    }
    const blocks = splitIntoBlocks(rawLines)
    const isDropped = (block: FrontmatterBlock): block is KeyedFrontmatterBlock => {
      const key = block.key
      return key !== null && !targets.every((target) => target.acceptedFields.includes(key))
    }
    const droppedKeys = blocks.filter(isDropped).map((block) => block.key)
    return {
      lines: blocks.filter((block) => !isDropped(block)).flatMap((block) => block.lines),
      notes: droppedKeys.length === 0 ? [] : [this.removedFieldsNote(droppedKeys, targets)],
    }
  }

  private removedFieldsNote(
    droppedKeys: readonly string[],
    targets: readonly SkillPortabilityTarget[],
  ): string {
    const labels = targets.map((target) => withArticle(target.label))
    const subject =
      labels.length === 1
        ? `${joinWith(labels, 'and')} does not accept`
        : `that ${joinWith(labels, 'and')} do not accept`
    const counted =
      droppedKeys.length === 1 ? '1 frontmatter field' : `${droppedKeys.length} frontmatter fields`
    return `Removed ${counted} ${subject}: ${describeFields(droppedKeys)}.`
  }

  private portableBody(
    document: ParsedDocument,
    targets: readonly SkillPortabilityTarget[],
  ): BodySection {
    const constructs = this.createScanner(this.argumentNames(document)).scan(document)
    const removable = constructs.filter((construct) => construct.removable)
    const retained = constructs.filter((construct) => !construct.removable)
    return {
      text: this.withoutConstructs(document.body.text, removable),
      notes: [...this.removalNotes(removable), ...this.retentionNotes(retained, targets)],
    }
  }

  private argumentNames(document: ParsedDocument): readonly string[] {
    return SkillFrontmatter.from(document)?.list('arguments') ?? []
  }

  private withoutConstructs(bodyText: string, constructs: readonly SkillBodyConstruct[]): string {
    if (constructs.length === 0) {
      return bodyText
    }
    const removed = new Array<boolean>(bodyText.length).fill(false)
    for (const construct of constructs) {
      for (let offset = construct.start; offset < construct.end; offset += 1) {
        removed[offset] = true
      }
    }
    const kept: string[] = []
    let lineStart = 0
    for (const line of bodyText.split('\n')) {
      const lineEnd = lineStart + line.length
      let survived = ''
      let touched = false
      for (let offset = lineStart; offset < lineEnd; offset += 1) {
        if (removed[offset] === true) {
          touched = true
        } else {
          survived += bodyText[offset] ?? ''
        }
      }
      const rebuilt = touched ? survived.replace(trailingBlanks, '') : survived
      const emptied = touched && rebuilt === '' && line.trim() !== ''
      if (!emptied) {
        kept.push(rebuilt)
      }
      lineStart = lineEnd + 1
    }
    return kept.join('\n')
  }

  private removalNotes(injections: readonly SkillBodyConstruct[]): string[] {
    if (injections.length === 0) {
      return []
    }
    const where = describeLines(injections.map((injection) => injection.range.start.line))
    if (injections.length === 1) {
      return [
        `Removed 1 dynamic context injection (${where}). Write out the information that command produced.`,
      ]
    }
    return [
      `Removed ${injections.length} dynamic context injections (${where}). Write out the information those commands produced.`,
    ]
  }

  private retentionNotes(
    constructs: readonly SkillBodyConstruct[],
    targets: readonly SkillPortabilityTarget[],
  ): string[] {
    const places = targets.length === 1 ? (targets[0]?.bodyPlace ?? '') : 'outside Claude Code'
    const substitution = places === '' ? 'is never substituted' : `is never substituted ${places}`
    return [...this.linesByConstructText(constructs)].map(
      ([text, lines]) =>
        `Left in place, rewrite by hand: \`${text}\` on ${describeLines(lines)} ${substitution}, so the literal text reaches the model.`,
    )
  }

  private linesByConstructText(constructs: readonly SkillBodyConstruct[]): Map<string, number[]> {
    const linesByText = new Map<string, number[]>()
    for (const construct of constructs) {
      const lines = linesByText.get(construct.text) ?? []
      if (!lines.includes(construct.range.start.line)) {
        lines.push(construct.range.start.line)
      }
      linesByText.set(construct.text, lines)
    }
    return linesByText
  }

  private assemble(
    document: ParsedDocument,
    frontmatterLines: readonly string[],
    bodyText: string,
  ): string {
    if (document.frontmatter === null) {
      return bodyText
    }
    const closingIndex = this.closingDelimiterIndex(document)
    if (closingIndex === -1) {
      return document.lines.join('\n')
    }
    const head = [
      document.lines[0] ?? '---',
      ...frontmatterLines,
      document.lines[closingIndex] ?? '---',
    ].join('\n')
    const bodyLineCount = document.lines.length - closingIndex - 1
    return bodyLineCount === 0 ? head : `${head}\n${bodyText}`
  }

  private closingDelimiterIndex(document: ParsedDocument): number {
    const frontmatter = document.frontmatter
    if (frontmatter === null) {
      return -1
    }
    const index = frontmatter.range.end.line - 1
    return frontmatterDelimiter.test(document.lines[index] ?? '') ? index : -1
  }
}
