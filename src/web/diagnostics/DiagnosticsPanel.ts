import type { Diagnostic, Severity } from '../../core'
import { createElement } from '../dom'
import { countBySeverity, countLabel } from './summary'

export type DiagnosticSelectListener = (diagnostic: Diagnostic) => void

const severityOrder: readonly Severity[] = ['error', 'warning', 'info']

const marker = (modifier: string): HTMLSpanElement =>
  createElement('span', `marker marker-${modifier}`)

const summaryOf = (diagnostics: readonly Diagnostic[]): HTMLParagraphElement => {
  const summary = createElement('p', 'panel-summary')
  summary.setAttribute('role', 'status')

  if (diagnostics.length === 0) {
    summary.append(marker('success'), createElement('span', undefined, 'No problems found'))
    return summary
  }

  const counts = countBySeverity(diagnostics)
  const list = createElement('span', 'panel-summary-counts')
  for (const severity of severityOrder) {
    const count = counts[severity]
    const entry = createElement('span', count === 0 ? 'count count-none' : 'count')
    entry.append(marker(severity), createElement('span', undefined, countLabel(severity, count)))
    list.append(entry)
  }
  summary.append(list)
  return summary
}

const rowOf = (diagnostic: Diagnostic, onSelect: DiagnosticSelectListener): HTMLLIElement => {
  const button = createElement('button', 'diagnostic')
  button.type = 'button'
  button.append(
    marker(diagnostic.severity),
    createElement('span', 'visually-hidden', `${diagnostic.severity}: `),
    createElement(
      'span',
      'diagnostic-location',
      `${String(diagnostic.range.start.line)}:${String(diagnostic.range.start.column)}`,
    ),
    createElement('span', 'diagnostic-message', diagnostic.message),
    createElement('span', 'diagnostic-rule', diagnostic.ruleId),
  )
  button.addEventListener('click', () => {
    onSelect(diagnostic)
  })

  const item = createElement('li')
  item.append(button)
  return item
}

export class DiagnosticsPanel {
  constructor(
    private readonly container: HTMLElement,
    private readonly onSelect: DiagnosticSelectListener,
  ) {}

  render(diagnostics: readonly Diagnostic[]): void {
    const list = createElement('ul', 'diagnostic-list')
    list.setAttribute('aria-label', 'Problems')
    for (const diagnostic of diagnostics) {
      list.append(rowOf(diagnostic, this.onSelect))
    }
    this.container.replaceChildren(summaryOf(diagnostics), list)
  }

  renderMessage(message: string): void {
    this.container.replaceChildren(createElement('p', 'panel-empty', message))
  }
}
