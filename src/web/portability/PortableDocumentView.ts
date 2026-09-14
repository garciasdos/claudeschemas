import type { PortableDocument } from '../../core'
import { createElement } from '../dom'

const copyLabel = 'Copy'
const copiedLabel = 'Copied'
const copyFailedLabel = 'Copy failed'
const labelResetMs = 1500

export class PortableDocumentView {
  private readonly copyButton = createElement('button', 'text-button', copyLabel)
  private readonly closeButton = createElement('button', 'text-button', 'Close')
  private readonly notesList = createElement('ul', 'portable-notes')
  private readonly textBlock = createElement('pre', 'portable-text')
  private portableText = ''
  private labelReset: ReturnType<typeof setTimeout> | null = null
  private focusBeforeOpen: HTMLElement | null = null

  constructor(private readonly dialog: HTMLDialogElement) {
    this.copyButton.type = 'button'
    this.closeButton.type = 'button'
    this.copyButton.addEventListener('click', () => {
      void this.copyToClipboard()
    })
    this.closeButton.addEventListener('click', () => {
      this.dialog.close()
    })
    this.dialog.addEventListener('close', () => {
      this.restoreFocus()
    })

    const actions = createElement('div', 'pane-actions')
    actions.append(this.copyButton, this.closeButton)
    const bar = createElement('div', 'portable-bar')
    bar.append(createElement('h2', 'portable-title', 'Portable version'), actions)
    this.dialog.replaceChildren(bar, this.notesList, this.textBlock)
  }

  open(portable: PortableDocument): void {
    this.focusBeforeOpen =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    this.resetCopyLabel()
    this.portableText = portable.text
    this.notesList.replaceChildren(
      ...portable.notes.map((note) => createElement('li', 'portable-note', note)),
    )
    this.notesList.hidden = portable.notes.length === 0
    this.textBlock.textContent = portable.text
    this.dialog.showModal()
  }

  private async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.portableText)
      this.flashCopyLabel(copiedLabel)
    } catch {
      this.flashCopyLabel(copyFailedLabel)
    }
  }

  private flashCopyLabel(label: string): void {
    this.clearLabelReset()
    this.copyButton.textContent = label
    this.labelReset = setTimeout(() => {
      this.labelReset = null
      this.copyButton.textContent = copyLabel
    }, labelResetMs)
  }

  private resetCopyLabel(): void {
    this.clearLabelReset()
    this.copyButton.textContent = copyLabel
  }

  private clearLabelReset(): void {
    if (this.labelReset !== null) {
      clearTimeout(this.labelReset)
      this.labelReset = null
    }
  }

  private restoreFocus(): void {
    this.focusBeforeOpen?.focus()
    this.focusBeforeOpen = null
  }
}
