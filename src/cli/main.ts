import { createDefaultRegistry } from '../core'
import { CliApplication } from './CliApplication'
import { createReportFormatter } from './createReportFormatter'
import { DocumentValidationService } from './DocumentValidationService'
import { FileDocumentSourceReader } from './FileDocumentSourceReader'
import { ProcessCliOutput } from './ProcessCliOutput'
import { readStandardInput } from './readStandardInput'

const application = new CliApplication(
  new DocumentValidationService(createDefaultRegistry()),
  new FileDocumentSourceReader(readStandardInput),
  createReportFormatter,
  new ProcessCliOutput(),
)

process.exitCode = await application.run(process.argv.slice(2))
