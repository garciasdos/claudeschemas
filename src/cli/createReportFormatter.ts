import { JsonReportFormatter } from './JsonReportFormatter'
import { TextReportFormatter } from './TextReportFormatter'
import type { ReportFormat, ReportFormatter } from './types'

export const createReportFormatter = (format: ReportFormat): ReportFormatter =>
  format === 'json' ? new JsonReportFormatter() : new TextReportFormatter()
