/** Безопасное чтение JSON из localStorage (приватный режим, битые данные и т.п.). */
export function readStorage<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T | null = (value) => value as T
): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return parse(JSON.parse(raw)) ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Хранилище недоступно или переполнено — состояние просто не сохранится.
  }
}
