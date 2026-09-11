import '../styles/base.css'
import '../styles/layout.css'
import '../styles/editor.css'
import '../styles/panel.css'
import { createDefaultRegistry, type DocumentKind } from '../core'
import { DiagnosticsPanel } from './diagnostics/DiagnosticsPanel'
import { requireElement } from './dom'
import { CodeMirrorEditor } from './editor/CodeMirrorEditor'
import { KindSelector } from './kinds/KindSelector'
import { SchemaLinkView } from './kinds/SchemaLinkView'
import { placeholderDocumentKind } from './placeholderDocumentKind'
import { createDocumentStore } from './state/createDocumentStore'
import { resolveKindText } from './state/resolveKindText'
import { ValidationController } from './state/ValidationController'

const emptyRegistryMessage =
  'No document kinds are registered yet. Once a kind is available it will appear in the selector above.'

const start = (): void => {
  const registry = createDefaultRegistry()
  registry.register(placeholderDocumentKind)

  const kinds = registry.list()
  const documentTitle = requireElement('document-title', HTMLHeadingElement)
  const loadSampleButton = requireElement('load-sample', HTMLButtonElement)
  const clearButton = requireElement('clear-document', HTMLButtonElement)

  const store = createDocumentStore()
  const controller = new ValidationController(150)
  const editor = new CodeMirrorEditor(requireElement('editor-host', HTMLDivElement))
  const panel = new DiagnosticsPanel(
    requireElement('diagnostics-panel', HTMLDivElement),
    (diagnostic) => {
      editor.revealRange(diagnostic.range)
    },
  )
  const schemaLink = new SchemaLinkView(requireElement('schema-link', HTMLAnchorElement))

  let activeKind: DocumentKind | null = null

  const applyText = (text: string): void => {
    editor.setText(text)
    if (activeKind !== null) {
      store.write(activeKind.id, text)
    }
    controller.setDocument(activeKind, text)
  }

  const activate = (kind: DocumentKind | null): void => {
    const previousSample = activeKind?.sample ?? null
    activeKind = kind
    schemaLink.update(kind)
    documentTitle.textContent = kind?.label ?? 'Document'
    loadSampleButton.disabled = kind === null
    clearButton.disabled = kind === null
    if (kind === null) {
      controller.setDocument(null, editor.getText())
      return
    }
    applyText(
      resolveKindText({
        storedText: store.read(kind.id),
        currentText: editor.getText(),
        previousSample,
        nextSample: kind.sample,
      }),
    )
  }

  const selector = new KindSelector(
    requireElement('kind-select', HTMLSelectElement),
    kinds,
    (id) => {
      activate(registry.get(id) ?? null)
    },
  )

  controller.subscribe((state) => {
    editor.setDiagnostics(state.diagnostics)
    if (state.kind === null) {
      panel.renderMessage(emptyRegistryMessage)
      return
    }
    panel.render(state.diagnostics)
  })

  editor.onChange((text) => {
    if (activeKind !== null) {
      store.write(activeKind.id, text)
    }
    controller.setText(text)
  })

  loadSampleButton.addEventListener('click', () => {
    if (activeKind !== null) {
      applyText(activeKind.sample)
    }
  })

  clearButton.addEventListener('click', () => {
    applyText('')
  })

  const initial = kinds[0] ?? null
  if (initial !== null) {
    selector.setSelected(initial.id)
  }
  activate(initial)
}

start()
