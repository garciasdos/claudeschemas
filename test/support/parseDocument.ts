import { MarkdownFrontmatterParser } from '../../src/core/document/MarkdownFrontmatterParser'
import type { ParsedDocument } from '../../src/core/document/types'

const parser = new MarkdownFrontmatterParser()

export const parseDocument = (text: string): ParsedDocument => parser.parse(text)

export const withFrontmatter = (frontmatter: string, body = 'Do the thing.\n'): ParsedDocument =>
  parseDocument(`---\n${frontmatter}\n---\n\n${body}`)
