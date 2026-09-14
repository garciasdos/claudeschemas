import type { DocumentTarget } from '../../core'
import { createElement } from '../dom'

export type TargetSelectListener = (id: string) => void

export class TargetSelector {
  constructor(
    private readonly element: HTMLSelectElement,
    onSelect: TargetSelectListener,
  ) {
    this.element.addEventListener('change', () => {
      onSelect(this.element.value)
    })
  }

  setTargets(targets: readonly DocumentTarget[]): void {
    if (targets.length === 0) {
      const placeholder = createElement('option', undefined, 'No targets')
      this.element.replaceChildren(placeholder)
      this.element.disabled = true
      return
    }

    this.element.replaceChildren(
      ...targets.map((target) => {
        const option = createElement('option', undefined, target.label)
        option.value = target.id
        return option
      }),
    )
    this.element.disabled = false
  }

  setSelected(id: string): void {
    this.element.value = id
  }
}
