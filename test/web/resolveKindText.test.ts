import { describe, expect, it } from 'vitest'
import { resolveKindText } from '../../src/web/state/resolveKindText'

describe('resolveKindText', () => {
  it('prefers the stored document for the kind', () => {
    expect(
      resolveKindText({
        storedText: 'stored',
        currentText: 'typed',
        previousSample: null,
        nextSample: 'sample',
      }),
    ).toBe('stored')
  })

  it('keeps a stored empty document instead of reloading the sample', () => {
    expect(
      resolveKindText({
        storedText: '',
        currentText: 'typed',
        previousSample: null,
        nextSample: 'sample',
      }),
    ).toBe('')
  })

  it('loads the sample into an empty editor', () => {
    expect(
      resolveKindText({
        storedText: null,
        currentText: '   \n ',
        previousSample: null,
        nextSample: 'sample',
      }),
    ).toBe('sample')
  })

  it('replaces the previous sample with the new one', () => {
    expect(
      resolveKindText({
        storedText: null,
        currentText: 'old sample',
        previousSample: 'old sample',
        nextSample: 'sample',
      }),
    ).toBe('sample')
  })

  it('keeps text the user typed', () => {
    expect(
      resolveKindText({
        storedText: null,
        currentText: 'typed by hand',
        previousSample: 'old sample',
        nextSample: 'sample',
      }),
    ).toBe('typed by hand')
  })
})
