import type { DocumentValidationService } from './DocumentValidationService'
import { parseCliOptions } from './parseCliOptions'
import { usageText } from './usageText'
import type {
  CliOutput,
  DocumentSourceReader,
  ReportFormatterFactory,
  ValidationReport,
} from './types'

export const cleanExitCode = 0
export const findingsExitCode = 1
export const usageExitCode = 2

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const hasProblems = (report: ValidationReport): boolean =>
  report.results.some((result) => result.problems.length + result.portability.length > 0)

const hasHints = (report: ValidationReport): boolean =>
  report.results.some((result) => result.hints.length > 0)

export class CliApplication {
  constructor(
    private readonly service: DocumentValidationService,
    private readonly reader: DocumentSourceReader,
    private readonly formatters: ReportFormatterFactory,
    private readonly output: CliOutput,
  ) {}

  async run(argv: readonly string[]): Promise<number> {
    const parsed = parseCliOptions(argv)
    if (parsed.outcome === 'error') {
      this.output.writeError(parsed.message)
      this.output.writeError(usageText)
      return usageExitCode
    }
    const options = parsed.options
    if (options.showHelp) {
      this.output.write(usageText)
      return cleanExitCode
    }
    if (options.listTargets) {
      this.writeTargets()
      return cleanExitCode
    }
    let report: ValidationReport
    try {
      const sources = await this.reader.read(options.paths)
      report = this.service.validate(sources, options.kindId, options.targetId)
    } catch (error) {
      this.output.writeError(messageOf(error))
      return usageExitCode
    }
    for (const line of this.formatters(options.format).format(report)) {
      this.output.write(line)
    }
    if (hasProblems(report) || (options.strict && hasHints(report))) {
      return findingsExitCode
    }
    return cleanExitCode
  }

  private writeTargets(): void {
    for (const kind of this.service.kinds()) {
      this.output.write(kind.id)
      for (const target of kind.targets) {
        const suffix = target.id === kind.defaultTargetId ? ' (default)' : ''
        this.output.write(`  ${target.id}  ${target.label}${suffix}`)
      }
    }
  }
}
