import { readFile } from 'node:fs/promises'
import type { DocumentSource, DocumentSourceReader } from './types'

export const standardInputName = '<stdin>'

export class FileDocumentSourceReader implements DocumentSourceReader {
  constructor(private readonly readStandardInput: () => Promise<string>) {}

  async read(paths: readonly string[]): Promise<readonly DocumentSource[]> {
    if (paths.length === 0) {
      return [{ name: standardInputName, text: await this.readStandardInput() }]
    }
    const sources: DocumentSource[] = []
    for (const path of paths) {
      sources.push(await this.readSource(path))
    }
    return sources
  }

  private async readSource(path: string): Promise<DocumentSource> {
    if (path === '-') {
      return { name: standardInputName, text: await this.readStandardInput() }
    }
    return { name: path, text: await readFile(path, 'utf8') }
  }
}
