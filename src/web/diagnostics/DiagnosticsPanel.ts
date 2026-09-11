import type { Diagnostic } from '../../core'
import { createElement } from '../dom'
import {
  countBySeverity,
  countLabel,
  groupDiagnostics,
  hintSectionTitle,
  problemSeverities,
} from './summary'

export type DiagnosticSelectListener = (diagnostic: Diagnostic) => void

const marker = (modifier: string): HTMLSpanElement =>
  createElement('span', `marker marker-${modifier}`)

const summaryOf = (problems: readonly Diagnostic[]): HTMLParagraphElement => {
  const summary = createElement('p', 'panel-summary')
  summary.setAttribute('role', 'status')

  if (problems.length === 0) {
    summary.append(marker('success'), createElement('span', undefined, 'No problems found'))
    return summary
  }

  const counts = countBySeverity(problems)
  const list = createElement('span', 'panel-summary-counts')
  for (const severity of problemSeverities) {
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

const listOf = (
  diagnostics: readonly Diagnostic[],
  label: string,
  onSelect: DiagnosticSelectListener,
): HTMLUListElement => {
  const list = createElement('ul', 'diagnostic-list')
  list.setAttribute('aria-label', label)
  for (const diagnostic of diagnostics) {
    list.append(rowOf(diagnostic, onSelect))
  }
  return list
}

const hintSectionOf = (
  hints: readonly Diagnostic[],
  onSelect: DiagnosticSelectListener,
): HTMLElement => {
  const section = createElement('section', 'panel-section')
  const title = createElement('h3', 'panel-section-title', hintSectionTitle(hints.length))
  section.append(title, listOf(hints, 'Improvement hints', onSelect))
  return section
}

export class DiagnosticsPanel {
  constructor(
    private readonly container: HTMLElement,
    private readonly onSelect: DiagnosticSelectListener,
  ) {}

  render(diagnostics: readonly Diagnostic[]): void {
    const { problems, hints } = groupDiagnostics(diagnostics)
    const children: HTMLElement[] = [
      summaryOf(problems),
      listOf(problems, 'Problems', this.onSelect),
    ]
    if (hints.length > 0) {
      children.push(hintSectionOf(hints, this.onSelect))
    }
    this.container.replaceChildren(...children)
  }

  renderMessage(message: string): void {
    this.container.replaceChildren(createElement('p', 'panel-empty', message))
  }
}
