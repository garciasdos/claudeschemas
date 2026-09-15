import type { CliOutput } from './types'

export class ProcessCliOutput implements CliOutput {
  write(line: string): void {
    process.stdout.write(`${line}\n`)
  }

  writeError(line: string): void {
    process.stderr.write(`${line}\n`)
  }
}
