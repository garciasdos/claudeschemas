import type { Diagnostic, DocumentTarget } from '../../core'
import {
  countBySeverity,
  groupDiagnostics,
  problemDiagnostics,
  problemSeverities,
} from '../../core'
import { createElement } from '../dom'
import { countLabel, hintSectionTitle, portabilitySectionTitle } from './summary'

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

const targetLabel = (id: string, targets: readonly DocumentTarget[]): string =>
  targets.find((target) => target.id === id)?.label ?? id

const targetTagOf = (
  targetIds: readonly string[],
  targets: readonly DocumentTarget[],
): HTMLSpanElement =>
  createElement(
    'span',
    'diagnostic-targets',
    targetIds.map((id) => targetLabel(id, targets)).join(', '),
  )

const rowOf = (
  diagnostic: Diagnostic,
  targets: readonly DocumentTarget[],
  onSelect: DiagnosticSelectListener,
): HTMLLIElement => {
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
  if (diagnostic.portability !== undefined) {
    button.append(targetTagOf(diagnostic.portability.targets, targets))
  }
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
  targets: readonly DocumentTarget[],
  onSelect: DiagnosticSelectListener,
): HTMLUListElement => {
  const list = createElement('ul', 'diagnostic-list')
  list.setAttribute('aria-label', label)
  for (const diagnostic of diagnostics) {
    list.append(rowOf(diagnostic, targets, onSelect))
  }
  return list
}

const sectionOf = (
  title: string,
  diagnostics: readonly Diagnostic[],
  label: string,
  targets: readonly DocumentTarget[],
  onSelect: DiagnosticSelectListener,
): HTMLElement => {
  const section = createElement('section', 'panel-section')
  section.append(
    createElement('h3', 'panel-section-title', title),
    listOf(diagnostics, label, targets, onSelect),
  )
  return section
}

export class DiagnosticsPanel {
  constructor(
    private readonly container: HTMLElement,
    private readonly onSelect: DiagnosticSelectListener,
  ) {}

  render(diagnostics: readonly Diagnostic[], targets: readonly DocumentTarget[]): void {
    const groups = groupDiagnostics(diagnostics)
    const { problems, portability, hints } = groups
    const children: HTMLElement[] = [
      summaryOf(problemDiagnostics(groups)),
      listOf(problems, 'Problems', targets, this.onSelect),
    ]
    if (portability.length > 0) {
      children.push(
        sectionOf(
          portabilitySectionTitle(portability.length),
          portability,
          'Portability problems',
          targets,
          this.onSelect,
        ),
      )
    }
    if (hints.length > 0) {
      children.push(
        sectionOf(
          hintSectionTitle(hints.length),
          hints,
          'Improvement hints',
          targets,
          this.onSelect,
        ),
      )
    }
    this.container.replaceChildren(...children)
  }

  renderMessage(message: string): void {
    this.container.replaceChildren(createElement('p', 'panel-empty', message))
  }
}
