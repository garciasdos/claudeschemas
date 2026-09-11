import type { DocumentKind } from '../../core'

export class SchemaLinkView {
  constructor(private readonly element: HTMLAnchorElement) {}

  update(kind: DocumentKind | null): void {
    if (kind === null) {
      this.element.removeAttribute('href')
      this.element.setAttribute('aria-disabled', 'true')
      this.element.textContent = 'Schema'
      return
    }
    this.element.href = kind.schemaUrl
    this.element.removeAttribute('aria-disabled')
    this.element.textContent = 'Schema'
  }
}
