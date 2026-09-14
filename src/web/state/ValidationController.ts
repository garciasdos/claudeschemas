import type { Diagnostic, DocumentKind } from '../../core'

export interface ValidationState {
  readonly kind: DocumentKind | null
  readonly text: string
  readonly targetId: string
  readonly diagnostics: readonly Diagnostic[]
}

export type ValidationListener = (state: ValidationState) => void

const failureDiagnostic = (error: unknown): Diagnostic => ({
  ruleId: 'validator.failed',
  severity: 'error',
  message: `The validator threw an error: ${error instanceof Error ? error.message : String(error)}`,
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
  source: 'schema',
})

export class ValidationController {
  private readonly listeners = new Set<ValidationListener>()
  private kind: DocumentKind | null = null
  private text = ''
  private targetId = ''
  private pending: ReturnType<typeof setTimeout> | null = null

  constructor(private readonly delayMs = 150) {}

  subscribe(listener: ValidationListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  setDocument(kind: DocumentKind | null, text: string, targetId: string): void {
    this.cancel()
    this.kind = kind
    this.text = text
    this.targetId = targetId
    this.run()
  }

  setTarget(targetId: string): void {
    this.cancel()
    this.targetId = targetId
    this.run()
  }

  setText(text: string): void {
    this.text = text
    this.cancel()
    this.pending = setTimeout(() => {
      this.pending = null
      this.run()
    }, this.delayMs)
  }

  dispose(): void {
    this.cancel()
    this.listeners.clear()
  }

  private cancel(): void {
    if (this.pending !== null) {
      clearTimeout(this.pending)
      this.pending = null
    }
  }

  private run(): void {
    const kind = this.kind
    const text = this.text
    const targetId = this.targetId
    let diagnostics: readonly Diagnostic[] = []
    if (kind !== null) {
      try {
        diagnostics = kind.validate(text, targetId)
      } catch (error) {
        diagnostics = [failureDiagnostic(error)]
      }
    }
    const state: ValidationState = { kind, text, targetId, diagnostics }
    for (const listener of this.listeners) {
      listener(state)
    }
  }
}
