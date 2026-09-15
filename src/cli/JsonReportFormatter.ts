import type { ReportFormatter, ValidationReport } from './types'

export class JsonReportFormatter implements ReportFormatter {
  format(report: ValidationReport): readonly string[] {
    return [JSON.stringify(report, null, 2)]
  }
}
