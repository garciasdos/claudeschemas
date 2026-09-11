import type { DocumentKind } from '../../core'
import { createElement } from '../dom'

export type KindSelectListener = (id: string) => void

export class KindSelector {
  constructor(
    private readonly element: HTMLSelectElement,
    kinds: readonly DocumentKind[],
    onSelect: KindSelectListener,
  ) {
    if (kinds.length === 0) {
      const placeholder = createElement('option', undefined, 'No document kinds')
      this.element.replaceChildren(placeholder)
      this.element.disabled = true
      return
    }

    this.element.replaceChildren(
      ...kinds.map((kind) => {
        const option = createElement('option', undefined, kind.label)
        option.value = kind.id
        return option
      }),
    )
    this.element.addEventListener('change', () => {
      onSelect(this.element.value)
    })
  }

  setSelected(id: string): void {
    this.element.value = id
  }
}
