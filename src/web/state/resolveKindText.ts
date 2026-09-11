export interface KindTextSources {
  readonly storedText: string | null
  readonly currentText: string
  readonly previousSample: string | null
  readonly nextSample: string
}

export const resolveKindText = (sources: KindTextSources): string => {
  if (sources.storedText !== null) {
    return sources.storedText
  }
  if (sources.currentText.trim().length === 0) {
    return sources.nextSample
  }
  if (sources.currentText === sources.previousSample) {
    return sources.nextSample
  }
  return sources.currentText
}
