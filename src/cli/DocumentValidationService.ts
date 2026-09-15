import {
  countBySeverity,
  groupDiagnostics,
  type DocumentKind,
  type DocumentKindRegistry,
} from '../core'
import { ValidationRequestError } from './ValidationRequestError'
import type { DocumentReport, DocumentSource, ValidationReport } from './types'

export class DocumentValidationService {
  constructor(private readonly registry: DocumentKindRegistry) {}

  kinds(): readonly DocumentKind[] {
    return this.registry.list()
  }

  validate(
    sources: readonly DocumentSource[],
    kindId: string,
    requestedTargetId: string | null,
  ): ValidationReport {
    const kind = this.resolveKind(kindId)
    const targetId = this.resolveTargetId(kind, requestedTargetId)
    return {
      kind: kind.id,
      target: targetId,
      results: sources.map((source) => reportFor(kind, source, targetId)),
    }
  }

  private resolveKind(kindId: string): DocumentKind {
    const kind = this.registry.get(kindId)
    if (kind === undefined) {
      const known = this.registry
        .list()
        .map((entry) => entry.id)
        .join(', ')
      throw new ValidationRequestError(`Unknown document kind "${kindId}". Known kinds: ${known}.`)
    }
    return kind
  }

  private resolveTargetId(kind: DocumentKind, requestedTargetId: string | null): string {
    if (requestedTargetId === null) {
      return kind.defaultTargetId
    }
    if (!kind.targets.some((target) => target.id === requestedTargetId)) {
      const known = kind.targets.map((target) => target.id).join(', ')
      throw new ValidationRequestError(
        `Unknown target "${requestedTargetId}" for kind "${kind.id}". Known targets: ${known}.`,
      )
    }
    return requestedTargetId
  }
}

const reportFor = (
  kind: DocumentKind,
  source: DocumentSource,
  targetId: string,
): DocumentReport => {
  const groups = groupDiagnostics(kind.validate(source.text, targetId))
  return {
    file: source.name,
    problems: groups.problems,
    portability: groups.portability,
    hints: groups.hints,
    counts: countBySeverity([...groups.problems, ...groups.portability, ...groups.hints]),
  }
}
