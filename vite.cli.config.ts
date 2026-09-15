import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

const skillFileName = 'SKILL.md'
const skillSourcePath = 'skills/claudeschemas/SKILL.md'

const agentSkill = (): Plugin => ({
  name: 'claudeschemas-agent-skill',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: skillFileName,
      source: readFileSync(skillSourcePath, 'utf8'),
    })
  },
})

export default defineConfig({
  plugins: [agentSkill()],
  build: {
    outDir: 'dist/api',
    emptyOutDir: false,
    target: 'node20',
    lib: {
      entry: 'src/cli/main.ts',
      formats: ['es'],
      fileName: () => 'cli.mjs',
    },
    rollupOptions: {
      external: [/^node:/],
      output: { banner: '#!/usr/bin/env node' },
    },
  },
})
