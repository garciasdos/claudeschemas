export interface DocumentStore {
  read(kindId: string): string | null
  write(kindId: string, text: string): void
}

export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
