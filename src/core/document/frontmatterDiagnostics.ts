import type { Diagnostic } from '../diagnostics/types'
import type { Frontmatter } from './types'

export const yamlSyntaxRuleId = 'frontmatter/yaml-syntax'

export const createYamlSyntaxDiagnostic = (frontmatter: Frontmatter): Diagnostic | null => {
  if (frontmatter.parseError === undefined) {
    return null
  }
  return {
    ruleId: yamlSyntaxRuleId,
    severity: 'error',
    message: frontmatter.parseError.message,
    range: frontmatter.parseError.range,
    source: 'frontmatter',
  }
}
