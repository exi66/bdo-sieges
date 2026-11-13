import { useEffect, useState } from "react"
import { readStorage, writeStorage } from "@/lib/storage"

/** useState, синхронизированный с localStorage. */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  parse?: (value: unknown) => T | null
) {
  const [value, setValue] = useState<T>(() =>
    readStorage(key, defaultValue, parse)
  )

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  return [value, setValue] as const
}
