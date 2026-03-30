import { useEffect, useState, useCallback, type SetStateAction } from "react"

export function useMapSync<T>(storageKey: string) {
  const [data, setData] = useState<T[]>(() => {
    if (typeof window === "undefined") return []
    const saved = localStorage.getItem(storageKey)
    try {
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error parsing localStorage data:", error)
      return []
    }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(data))
    }
  }, [data, storageKey])

  const updateData = useCallback((newData: SetStateAction<T[]>) => {
    setData((prev) => {
      const resolvedData = newData instanceof Function ? newData(prev) : newData
      if (JSON.stringify(resolvedData) === JSON.stringify(prev)) {
        return prev
      }
      return resolvedData
    })
  }, [])

  const exportData = useCallback(() => {
    try {
      const jsonString = JSON.stringify(data)
      return btoa(encodeURIComponent(jsonString))
    } catch (error) {
      console.error("Export failed:", error)
      return ""
    }
  }, [data])

  const isValidMarker = useCallback((item: unknown): item is T => {
    if (!item || typeof item !== "object") return false

    // Приводим к Record<string, unknown>, чтобы можно было проверять поля
    const marker = item as Record<string, unknown>

    return (
      typeof marker.id === "number" &&
      marker.position !== null &&
      typeof marker.position === "object" &&
      typeof (marker.position as Record<string, unknown>).lat === "number" &&
      typeof (marker.position as Record<string, unknown>).lng === "number" &&
      typeof marker.type === "number" &&
      typeof marker.color === "number"
    )
  }, [])

  const importData = useCallback(
    (base64String: string) => {
      try {
        const jsonString = decodeURIComponent(atob(base64String))
        const parsed = JSON.parse(jsonString)

        if (Array.isArray(parsed) && parsed.every(isValidMarker)) {
          setData(parsed as T[])
          return true
        }

        return false
      } catch (error) {
        console.error("Import failed:", error)
        return false
      }
    },
    [isValidMarker]
  )

  return {
    data,
    setData: updateData,
    exportData,
    importData,
  }
}
