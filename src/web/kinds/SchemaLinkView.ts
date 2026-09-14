import type { DocumentTarget } from '../../core'

export class SchemaLinkView {
  constructor(private readonly element: HTMLAnchorElement) {}

  update(target: DocumentTarget | null): void {
    if (target === null) {
      this.element.removeAttribute('href')
      this.element.setAttribute('aria-disabled', 'true')
      this.element.textContent = 'Schema'
      return
    }
    this.element.href = target.schemaUrl
    this.element.removeAttribute('aria-disabled')
    this.element.textContent = 'Schema'
  }
}
