import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
  bracketMatching,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'
import { yamlFrontmatter } from '@codemirror/lang-yaml'
import { lintGutter, setDiagnostics } from '@codemirror/lint'
import { Annotation, EditorSelection, EditorState } from '@codemirror/state'
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from '@codemirror/view'
import type { Diagnostic, Range } from '../../core'
import { rangeToOffsets, toLintDiagnostics } from './diagnosticMapper'
import { documentHighlightStyle } from './highlightStyle'
import type { TextChangeListener, TextEditor } from './TextEditor'

const externalUpdate = Annotation.define<boolean>()

export class CodeMirrorEditor implements TextEditor {
  private readonly view: EditorView
  private readonly listeners = new Set<TextChangeListener>()

  constructor(parent: HTMLElement) {
    this.view = new EditorView({
      parent,
      state: EditorState.create({
        doc: '',
        extensions: [
          lineNumbers(),
          lintGutter(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          highlightSpecialChars(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          indentUnit.of('  '),
          EditorState.allowMultipleSelections.of(true),
          EditorView.lineWrapping,
          keymap.of([...defaultKeymap, ...historyKeymap]),
          syntaxHighlighting(documentHighlightStyle),
          yamlFrontmatter({ content: markdown() }),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) {
              return
            }
            if (update.transactions.some((transaction) => transaction.annotation(externalUpdate))) {
              return
            }
            const text = update.state.doc.toString()
            for (const listener of this.listeners) {
              listener(text)
            }
          }),
        ],
      }),
    })
  }

  getText(): string {
    return this.view.state.doc.toString()
  }

  setText(text: string): void {
    if (text === this.getText()) {
      return
    }
    this.view.dispatch({
      changes: { from: 0, to: this.view.state.doc.length, insert: text },
      selection: { anchor: 0 },
      annotations: externalUpdate.of(true),
      scrollIntoView: true,
    })
  }

  onChange(listener: TextChangeListener): void {
    this.listeners.add(listener)
  }

  revealRange(range: Range): void {
    const offsets = rangeToOffsets(this.view.state.doc, range)
    const selection = EditorSelection.range(offsets.from, offsets.to)
    this.view.dispatch({
      selection,
      effects: EditorView.scrollIntoView(selection, { y: 'center' }),
    })
    this.view.focus()
  }

  setDiagnostics(diagnostics: readonly Diagnostic[]): void {
    this.view.dispatch(
      setDiagnostics(this.view.state, toLintDiagnostics(diagnostics, this.view.state.doc)),
    )
  }
}
