import { describe, expect, it } from 'vitest'
import {
  countLabel,
  hintSectionTitle,
  portabilitySectionTitle,
} from '../../src/web/diagnostics/summary'

describe('countLabel', () => {
  it('uses the singular form for one problem', () => {
    expect(countLabel('error', 1)).toBe('1 error')
  })

  it('uses the plural form for other counts', () => {
    expect(countLabel('warning', 0)).toBe('0 warnings')
    expect(countLabel('warning', 3)).toBe('3 warnings')
  })

  it('leaves info uncountable', () => {
    expect(countLabel('info', 2)).toBe('2 info')
  })

  it('counts hints like problems', () => {
    expect(countLabel('hint', 1)).toBe('1 hint')
    expect(countLabel('hint', 4)).toBe('4 hints')
  })
})

describe('hintSectionTitle', () => {
  it('uses the singular for one hint', () => {
    expect(hintSectionTitle(1)).toBe('1 improvement hint')
    expect(hintSectionTitle(3)).toBe('3 improvement hints')
  })
})

describe('portabilitySectionTitle', () => {
  it('uses the singular for one portability problem', () => {
    expect(portabilitySectionTitle(1)).toBe('1 portability problem')
    expect(portabilitySectionTitle(2)).toBe('2 portability problems')
  })
})
