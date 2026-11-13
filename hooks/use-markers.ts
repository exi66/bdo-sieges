import { useCallback, useMemo } from "react"
import type { UserMarker } from "@/types/map"
import { createMarkerId, parseMarker } from "@/lib/map/markers"
import { usePersistentState } from "@/hooks/use-persistent-state"

export type NewMarker = Omit<UserMarker, "id">

/** Битые записи из старых версий отбрасываются по одной, а не всем списком. */
const parseStoredMarkers = (value: unknown): UserMarker[] | null =>
  Array.isArray(value)
    ? value.map(parseMarker).filter((m): m is UserMarker => m !== null)
    : null

/** Пользовательские маркеры с сохранением в localStorage. */
export function useMarkers() {
  const [markers, setMarkers] = usePersistentState<UserMarker[]>(
    "markers",
    [],
    parseStoredMarkers
  )

  const addMarker = useCallback(
    (marker: NewMarker) =>
      setMarkers((prev) => [...prev, { ...marker, id: createMarkerId(prev) }]),
    [setMarkers]
  )

  const updateMarker = useCallback(
    (id: number, updates: Partial<Omit<UserMarker, "id">>) =>
      setMarkers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      ),
    [setMarkers]
  )

  const removeMarker = useCallback(
    (id: number) => setMarkers((prev) => prev.filter((m) => m.id !== id)),
    [setMarkers]
  )

  return useMemo(
    () => ({
      markers,
      addMarker,
      updateMarker,
      removeMarker,
      replaceMarkers: setMarkers,
    }),
    [markers, addMarker, updateMarker, removeMarker, setMarkers]
  )
}
