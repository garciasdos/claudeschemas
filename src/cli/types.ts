import type { Diagnostic, SeverityCounts } from '../core'

export type ReportFormat = 'text' | 'json'

export interface CliOptions {
  readonly paths: readonly string[]
  readonly kindId: string
  readonly targetId: string | null
  readonly format: ReportFormat
  readonly strict: boolean
  readonly showHelp: boolean
  readonly listTargets: boolean
}

export interface DocumentSource {
  readonly name: string
  readonly text: string
}

export interface DocumentSourceReader {
  read(paths: readonly string[]): Promise<readonly DocumentSource[]>
}

export interface DocumentReport {
  readonly file: string
  readonly problems: readonly Diagnostic[]
  readonly portability: readonly Diagnostic[]
  readonly hints: readonly Diagnostic[]
  readonly counts: SeverityCounts
}

export interface ValidationReport {
  readonly kind: string
  readonly target: string
  readonly results: readonly DocumentReport[]
}

export interface ReportFormatter {
  format(report: ValidationReport): readonly string[]
}

export type ReportFormatterFactory = (format: ReportFormat) => ReportFormatter

export interface CliOutput {
  write(line: string): void
  writeError(line: string): void
}
