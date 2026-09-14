import type { Diagnostic } from '../../diagnostics/types'
import type { DocumentParser, ParsedDocument } from '../../document/types'
import type { Rule } from '../../rules/types'
import type { SchemaValidator } from '../../schema/types'
import type { DocumentKind, DocumentTarget, PortableDocument } from '../types'
import type { SkillPortabilityTarget, SkillTargetSelection } from './targets/types'
import { FrontmatterKeyLocator } from '../../document/FrontmatterKeyLocator'
import { createYamlSyntaxDiagnostic } from '../../document/frontmatterDiagnostics'
import { createSchemaDiagnostics } from '../../schema/createSchemaDiagnostics'
import { normalizeDiagnostics } from '../../diagnostics/normalizeDiagnostics'
import { SkillBodyPortabilityCheck } from './portability/SkillBodyPortabilityCheck'
import { SkillFrontmatterPortabilityCheck } from './portability/SkillFrontmatterPortabilityCheck'
import { PortableSkillDocumentBuilder } from './portability/PortableSkillDocumentBuilder'
import { mergePortabilityDiagnostics } from './portability/mergePortabilityDiagnostics'

const suppressedRuleIdsOf = (targets: readonly SkillPortabilityTarget[]): ReadonlySet<string> => {
  const ruleIds = new Set<string>()
  for (const target of targets) {
    for (const ruleId of target.suppressedRuleIds) {
      ruleIds.add(ruleId)
    }
  }
  return ruleIds
}

export class SkillDocumentKind implements DocumentKind {
  readonly id = 'skill'
  readonly label = 'SKILL.md'
  readonly targets: readonly DocumentTarget[]

  constructor(
    private readonly parser: DocumentParser,
    private readonly schemaValidator: SchemaValidator,
    private readonly rules: readonly Rule[],
    readonly schemaUrl: string,
    readonly sample: string,
    private readonly selections: readonly SkillTargetSelection[],
    readonly defaultTargetId: string,
    private readonly frontmatterPortabilityCheck: SkillFrontmatterPortabilityCheck,
    private readonly bodyPortabilityCheck: SkillBodyPortabilityCheck,
    private readonly portableBuilder: PortableSkillDocumentBuilder,
  ) {
    this.targets = selections.map((selection) => ({
      id: selection.id,
      label: selection.label,
      schemaUrl: selection.schemaUrl,
    }))
  }

  validate(text: string, targetId: string = this.defaultTargetId): Diagnostic[] {
    const document = this.parser.parse(text)
    const base = this.baseDiagnostics(document)
    const portabilityTargets = this.portabilityTargetsFor(targetId)
    if (portabilityTargets.length === 0) {
      return normalizeDiagnostics(base)
    }
    const suppressed = suppressedRuleIdsOf(portabilityTargets)
    const kept = base.filter((diagnostic) => !suppressed.has(diagnostic.ruleId))
    const findings = portabilityTargets.flatMap((target) => [
      ...this.frontmatterPortabilityCheck.check(document, target),
      ...this.bodyPortabilityCheck.check(document, target),
    ])
    return normalizeDiagnostics([...kept, ...mergePortabilityDiagnostics(findings)])
  }

  toPortable(text: string, targetId: string): PortableDocument | null {
    const portabilityTargets = this.portabilityTargetsFor(targetId)
    return portabilityTargets.length === 0
      ? null
      : this.portableBuilder.build(text, portabilityTargets)
  }

  private portabilityTargetsFor(targetId: string): readonly SkillPortabilityTarget[] {
    const selected =
      this.selections.find((selection) => selection.id === targetId) ??
      this.selections.find((selection) => selection.id === this.defaultTargetId)
    return selected?.portabilityTargets ?? []
  }

  private baseDiagnostics(document: ParsedDocument): Diagnostic[] {
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

    return diagnostics
  }
}
