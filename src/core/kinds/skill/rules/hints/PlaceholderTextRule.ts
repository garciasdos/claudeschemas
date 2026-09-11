import type { Diagnostic, Severity } from '../../../../diagnostics/types'
import type { ParsedDocument } from '../../../../document/types'
import type { Rule } from '../../../../rules/types'
import { findInBody } from '../bodyMatches'

const placeholderText =
  /\b(?:TODO|TBD|FIXME|XXX)\b|\b[Ll]orem ipsum\b|<(?:insert|add|describe|your) [^>\n]*>|\[(?:insert|add|describe|your) [^\]\n]*\]/g

export class PlaceholderTextRule implements Rule {
  readonly id = 'skill/placeholder-text'
  readonly severity: Severity = 'hint'

  check(document: ParsedDocument): Diagnostic[] {
    return findInBody(document, placeholderText).map((match) => ({
      ruleId: this.id,
      severity: this.severity,
      message: `"${match.value[0]}" reads as a placeholder left in the instructions. Claude follows the body as written, so finish the text or remove it before sharing the skill.`,
      range: match.range,
      source: 'body',
    }))
  }
}
