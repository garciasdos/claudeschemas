import type { ParsedDocument } from '../../../document/types'

export interface FencedRegion {
  readonly infoString: string
  readonly start: number
  readonly end: number
}

export interface BodyLine {
  readonly text: string
  readonly start: number
}

const fenceOpener = /^ {0,3}(`{3,}|~{3,})(.*)$/

export const readBodyLines = (text: string): BodyLine[] => {
  const lines: BodyLine[] = []
  let start = 0
  for (const line of text.split('\n')) {
    lines.push({ text: line, start })
    start += line.length + 1
  }
  return lines
}

const closesFence = (line: string, marker: string): boolean => {
  const match = fenceOpener.exec(line)
  return (
    match !== null &&
    match[1] !== undefined &&
    match[1][0] === marker[0] &&
    match[1].length >= marker.length &&
    (match[2] ?? '').trim().length === 0
  )
}

const findClosingFence = (
  lines: readonly BodyLine[],
  openIndex: number,
  marker: string,
): number => {
  for (let index = openIndex + 1; index < lines.length; index += 1) {
    if (closesFence(lines[index]?.text ?? '', marker)) {
      return index
    }
  }
  return lines.length - 1
}

export const fencedRegions = (document: ParsedDocument): FencedRegion[] => {
  const lines = readBodyLines(document.body.text)
  const regions: FencedRegion[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (line === undefined) {
      break
    }
    const opener = fenceOpener.exec(line.text)
    const marker = opener?.[1]
    if (marker === undefined) {
      index += 1
      continue
    }
    const closingIndex = findClosingFence(lines, index, marker)
    const close = lines[closingIndex]
    regions.push({
      infoString: (opener?.[2] ?? '').trim(),
      start: line.start,
      end: (close?.start ?? line.start) + (close?.text.length ?? 0),
    })
    index = closingIndex + 1
  }

  return regions
}

export const isInsideFence = (regions: readonly FencedRegion[], offset: number): boolean =>
  regions.some((region) => offset >= region.start && offset < region.end)
