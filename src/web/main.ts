import '../styles/base.css'
import '../styles/layout.css'
import '../styles/editor.css'
import '../styles/panel.css'
import '../styles/portable.css'
import {
  createDefaultRegistry,
  groupDiagnostics,
  type DocumentKind,
  type DocumentTarget,
} from '../core'
import { DiagnosticsPanel } from './diagnostics/DiagnosticsPanel'
import { requireElement } from './dom'
import { CodeMirrorEditor } from './editor/CodeMirrorEditor'
import { KindSelector } from './kinds/KindSelector'
import { SchemaLinkView } from './kinds/SchemaLinkView'
import { TargetSelector } from './kinds/TargetSelector'
import { PortableDocumentView } from './portability/PortableDocumentView'
import { createDocumentStore } from './state/createDocumentStore'
import { resolveKindText } from './state/resolveKindText'
import { ValidationController } from './state/ValidationController'

const emptyRegistryMessage =
  'No document kinds are registered yet. Once a kind is available it will appear in the selector above.'

const start = (): void => {
  const registry = createDefaultRegistry()

  const kinds = registry.list()
  const documentTitle = requireElement('document-title', HTMLHeadingElement)
  const loadSampleButton = requireElement('load-sample', HTMLButtonElement)
  const clearButton = requireElement('clear-document', HTMLButtonElement)
  const portableButton = requireElement('portable-version', HTMLButtonElement)

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
  const portableView = new PortableDocumentView(
    requireElement('portable-dialog', HTMLDialogElement),
  )

  let activeKind: DocumentKind | null = null
  let activeTargetId = ''
  let rememberedTargetId: string | null = null

  const targetOf = (kind: DocumentKind | null, targetId: string): DocumentTarget | null =>
    kind?.targets.find((target) => target.id === targetId) ?? null

  const resolveTargetId = (kind: DocumentKind): string => {
    const remembered = rememberedTargetId
    if (remembered !== null && kind.targets.some((target) => target.id === remembered)) {
      return remembered
    }
    return kind.defaultTargetId
  }

  const applyText = (text: string): void => {
    editor.setText(text)
    if (activeKind !== null) {
      store.write(activeKind.id, text)
    }
    controller.setDocument(activeKind, text, activeTargetId)
  }

  const activate = (kind: DocumentKind | null): void => {
    const previousSample = activeKind?.sample ?? null
    activeKind = kind
    activeTargetId = kind === null ? '' : resolveTargetId(kind)
    targetSelector.setTargets(kind?.targets ?? [])
    targetSelector.setSelected(activeTargetId)
    schemaLink.update(targetOf(kind, activeTargetId))
    documentTitle.textContent = kind?.label ?? 'Document'
    loadSampleButton.disabled = kind === null
    clearButton.disabled = kind === null
    if (kind === null) {
      controller.setDocument(null, editor.getText(), activeTargetId)
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

  const targetSelector = new TargetSelector(
    requireElement('target-select', HTMLSelectElement),
    (id) => {
      rememberedTargetId = id
      activeTargetId = id
      schemaLink.update(targetOf(activeKind, id))
      controller.setTarget(id)
    },
  )

  controller.subscribe((state) => {
    editor.setDiagnostics(state.diagnostics)
    if (state.kind === null) {
      portableButton.hidden = true
      panel.renderMessage(emptyRegistryMessage)
      return
    }
    portableButton.hidden = groupDiagnostics(state.diagnostics).portability.length === 0
    panel.render(state.diagnostics, state.kind.targets)
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

  portableButton.addEventListener('click', () => {
    if (activeKind === null) {
      return
    }
    const portable = activeKind.toPortable(editor.getText(), activeTargetId)
    if (portable !== null) {
      portableView.open(portable)
    }
  })

  const initial = kinds[0] ?? null
  if (initial !== null) {
    selector.setSelected(initial.id)
  }
  activate(initial)
}

start()
