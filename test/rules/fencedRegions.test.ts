import { describe, expect, it } from 'vitest'
import { fencedRegions, isInsideFence } from '../../src/core/kinds/skill/rules/fencedRegions'
import { parseDocument } from '../support/parseDocument'

const regionsOf = (body: string) =>
  fencedRegions(parseDocument(body)).map((region) => region.infoString)

describe('fencedRegions', () => {
  it('finds nothing in prose', () => {
    expect(fencedRegions(parseDocument('Just text.\n'))).toEqual([])
  })

  it('reports the info string of each fence', () => {
    expect(regionsOf('```markdown\na\n```\n\n```!\nb\n```\n')).toEqual(['markdown', '!'])
  })

  it('reports an empty info string for a bare fence', () => {
    expect(regionsOf('```\na\n```\n')).toEqual([''])
  })

  it('accepts tilde fences', () => {
    expect(regionsOf('~~~bash\na\n~~~\n')).toEqual(['bash'])
  })

  it('does not close a fence on a shorter marker', () => {
    expect(regionsOf('````md\n```\nstill inside\n````\n')).toEqual(['md'])
  })

  it('runs an unterminated fence to the end of the body', () => {
    const document = parseDocument('```md\nopen forever\n')
    const region = fencedRegions(document)[0]
    expect(region?.infoString).toBe('md')
    expect(region?.end).toBe(document.body.text.length)
  })

  it('covers the fence lines themselves', () => {
    const body = 'before\n```md\ninside\n```\nafter\n'
    const regions = fencedRegions(parseDocument(body))
    expect(isInsideFence(regions, body.indexOf('```md'))).toBe(true)
    expect(isInsideFence(regions, body.indexOf('inside'))).toBe(true)
    expect(isInsideFence(regions, body.indexOf('before'))).toBe(false)
    expect(isInsideFence(regions, body.indexOf('after'))).toBe(false)
  })
})
