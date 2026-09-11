import type { Diagnostic } from '../../diagnostics/types'
import type { DocumentParser } from '../../document/types'
import type { Rule } from '../../rules/types'
import type { SchemaValidator } from '../../schema/types'
import type { DocumentKind } from '../types'
import { FrontmatterKeyLocator } from '../../document/FrontmatterKeyLocator'
import { createYamlSyntaxDiagnostic } from '../../document/frontmatterDiagnostics'
import { createSchemaDiagnostics } from '../../schema/createSchemaDiagnostics'
import { normalizeDiagnostics } from '../../diagnostics/normalizeDiagnostics'

export class SkillDocumentKind implements DocumentKind {
  readonly id = 'skill'
  readonly label = 'SKILL.md'

  constructor(
    private readonly parser: DocumentParser,
    private readonly schemaValidator: SchemaValidator,
    private readonly rules: readonly Rule[],
    readonly schemaUrl: string,
    readonly sample: string,
  ) {}

  validate(text: string): Diagnostic[] {
    const document = this.parser.parse(text)
    const diagnostics: Diagnostic[] = []
    const frontmatter = document.frontmatter

    if (frontmatter !== null) {
      const parseError = createYamlSyntaxDiagnostic(frontmatter)
      if (parseError === null) {
        diagnostics.push(
          ...createSchemaDiagnostics(
            this.schemaValidator.validate(frontmatter.data ?? {}),
            new FrontmatterKeyLocator(frontmatter),
            frontmatter.range,
          ),
        )
      } else {
        diagnostics.push(parseError)
      }
    }

    for (const rule of this.rules) {
      diagnostics.push(...rule.check(document))
    }

    return normalizeDiagnostics(diagnostics)
  }
}
