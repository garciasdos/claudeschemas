import type { CliOptions, ReportFormat } from './types'

export type CliOptionsResult =
  | { readonly outcome: 'options'; readonly options: CliOptions }
  | { readonly outcome: 'error'; readonly message: string }

interface MutableOptions {
  paths: string[]
  kindId: string
  targetId: string | null
  format: ReportFormat
  strict: boolean
  showHelp: boolean
  listTargets: boolean
}

const defaults = (): MutableOptions => ({
  paths: [],
  kindId: 'skill',
  targetId: null,
  format: 'text',
  strict: false,
  showHelp: false,
  listTargets: false,
})

const valueFlags = new Set(['--kind', '--target'])

const splitFlag = (argument: string): { name: string; inlineValue: string | null } => {
  const separator = argument.indexOf('=')
  if (separator === -1) {
    return { name: argument, inlineValue: null }
  }
  return { name: argument.slice(0, separator), inlineValue: argument.slice(separator + 1) }
}

export const parseCliOptions = (argv: readonly string[]): CliOptionsResult => {
  const options = defaults()
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '-' || !argument.startsWith('-')) {
      options.paths.push(argument)
      continue
    }
    const { name, inlineValue } = splitFlag(argument)
    if (valueFlags.has(name)) {
      const value = inlineValue ?? argv[index + 1]
      if (value === undefined || value === '') {
        return { outcome: 'error', message: `${name} needs a value.` }
      }
      if (inlineValue === null) {
        index += 1
      }
      if (name === '--kind') {
        options.kindId = value
      } else {
        options.targetId = value
      }
      continue
    }
    if (inlineValue !== null) {
      return { outcome: 'error', message: `${name} does not take a value.` }
    }
    switch (name) {
      case '--json':
        options.format = 'json'
        break
      case '--strict':
        options.strict = true
        break
      case '--list-targets':
        options.listTargets = true
        break
      case '-h':
      case '--help':
        options.showHelp = true
        break
      default:
        return { outcome: 'error', message: `Unknown option ${name}.` }
    }
  }
  return { outcome: 'options', options }
}
