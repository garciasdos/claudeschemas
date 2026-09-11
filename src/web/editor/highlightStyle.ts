import { HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

export const documentHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, color: 'var(--syntax-heading)', fontWeight: '600' },
  { tag: tags.strong, fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: [tags.link, tags.url], color: 'var(--syntax-link)' },
  { tag: tags.monospace, color: 'var(--syntax-string)' },
  { tag: tags.quote, color: 'var(--text-muted)' },
  {
    tag: [tags.list, tags.processingInstruction, tags.contentSeparator],
    color: 'var(--syntax-meta)',
  },
  { tag: [tags.propertyName, tags.definition(tags.propertyName)], color: 'var(--syntax-keyword)' },
  { tag: [tags.string, tags.special(tags.string)], color: 'var(--syntax-string)' },
  { tag: [tags.number, tags.bool, tags.atom, tags.null], color: 'var(--syntax-atom)' },
  { tag: tags.keyword, color: 'var(--syntax-keyword)' },
  { tag: tags.comment, color: 'var(--syntax-meta)', fontStyle: 'italic' },
  { tag: tags.punctuation, color: 'var(--text-muted)' },
  { tag: tags.invalid, color: 'var(--error)' },
])
