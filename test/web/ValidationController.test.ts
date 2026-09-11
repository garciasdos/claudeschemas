import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Diagnostic, DocumentKind } from '../../src/core'
import {
  ValidationController,
  type ValidationState,
} from '../../src/web/state/ValidationController'

const diagnosticFor = (text: string): Diagnostic => ({
  ruleId: 'demo.rule',
  severity: 'error',
  message: text,
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
  source: 'body',
})

const makeKind = (id: string, validate: (text: string) => Diagnostic[]): DocumentKind => ({
  id,
  label: id,
  schemaUrl: `/schemas/${id}.json`,
  sample: `sample for ${id}`,
  validate,
})

describe('ValidationController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('validates immediately when the document is set', () => {
    const controller = new ValidationController(150)
    const states: ValidationState[] = []
    controller.subscribe((state) => states.push(state))

    controller.setDocument(
      makeKind('skill', (text) => [diagnosticFor(text)]),
      'hello',
    )

    expect(states).toHaveLength(1)
    expect(states[0].diagnostics[0].message).toBe('hello')
  })

  it('does not validate before the debounce delay elapses', () => {
    const validate = vi.fn(() => [])
    const controller = new ValidationController(150)
    controller.setDocument(makeKind('skill', validate), '')
    validate.mockClear()

    controller.setText('a')
    vi.advanceTimersByTime(149)

    expect(validate).not.toHaveBeenCalled()
  })

  it('validates once with the latest text after rapid changes', () => {
    const validate = vi.fn(() => [])
    const controller = new ValidationController(150)
    controller.setDocument(makeKind('skill', validate), '')
    validate.mockClear()

    controller.setText('a')
    vi.advanceTimersByTime(100)
    controller.setText('ab')
    vi.advanceTimersByTime(100)
    controller.setText('abc')
    vi.advanceTimersByTime(150)

    expect(validate).toHaveBeenCalledTimes(1)
    expect(validate).toHaveBeenCalledWith('abc')
  })

  it('cancels a pending validation when the document is replaced', () => {
    const validate = vi.fn(() => [])
    const controller = new ValidationController(150)
    const kind = makeKind('skill', validate)
    controller.setDocument(kind, '')
    controller.setText('pending')
    validate.mockClear()

    controller.setDocument(kind, 'replaced')
    vi.advanceTimersByTime(500)

    expect(validate).toHaveBeenCalledTimes(1)
    expect(validate).toHaveBeenCalledWith('replaced')
  })

  it('reports an empty diagnostic list and a null kind when no kind is active', () => {
    const controller = new ValidationController(150)
    const states: ValidationState[] = []
    controller.subscribe((state) => states.push(state))

    controller.setDocument(null, 'anything')

    expect(states[0].kind).toBeNull()
    expect(states[0].diagnostics).toEqual([])
  })

  it('notifies every subscriber and stops after unsubscribing', () => {
    const controller = new ValidationController(150)
    const first = vi.fn()
    const second = vi.fn()
    controller.subscribe(first)
    const unsubscribe = controller.subscribe(second)
    const kind = makeKind('skill', () => [])

    controller.setDocument(kind, 'one')
    unsubscribe()
    controller.setDocument(kind, 'two')

    expect(first).toHaveBeenCalledTimes(2)
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('reports a diagnostic when the validator throws', () => {
    const controller = new ValidationController(150)
    const states: ValidationState[] = []
    controller.subscribe((state) => states.push(state))

    controller.setDocument(
      makeKind('skill', () => {
        throw new Error('boom')
      }),
      'text',
    )

    expect(states[0].diagnostics).toHaveLength(1)
    expect(states[0].diagnostics[0].ruleId).toBe('validator.failed')
    expect(states[0].diagnostics[0].message).toContain('boom')
  })

  it('drops pending work and subscribers when disposed', () => {
    const validate = vi.fn(() => [])
    const controller = new ValidationController(150)
    controller.setDocument(makeKind('skill', validate), '')
    controller.setText('later')
    validate.mockClear()

    controller.dispose()
    vi.advanceTimersByTime(500)

    expect(validate).not.toHaveBeenCalled()
  })
})
