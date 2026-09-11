import type { Diagnostic, Range } from '../../core'

export type TextChangeListener = (text: string) => void

export interface TextEditor {
  getText(): string
  setText(text: string): void
  onChange(listener: TextChangeListener): void
  revealRange(range: Range): void
  setDiagnostics(diagnostics: readonly Diagnostic[]): void
}
