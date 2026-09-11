import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import skillSchema from './schemas/skill.schema.json'

const schemaAssets = [
  { fileName: 'schemas/skill.schema.json', source: `${JSON.stringify(skillSchema, null, 2)}\n` },
]

interface SchemaResponse {
  setHeader(name: string, value: string): void
  end(body: string): void
}

const staticSchemas = (): Plugin => ({
  name: 'claudeschemas-static-schemas',
  configureServer(server) {
    for (const asset of schemaAssets) {
      server.middlewares.use(`/${asset.fileName}`, (_request, response: SchemaResponse) => {
        response.setHeader('Content-Type', 'application/json')
        response.end(asset.source)
      })
    }
  },
  generateBundle() {
    for (const asset of schemaAssets) {
      this.emitFile({ type: 'asset', fileName: asset.fileName, source: asset.source })
    }
  },
})

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/claudeschemas/' : '/',
  plugins: [staticSchemas()],
}))
