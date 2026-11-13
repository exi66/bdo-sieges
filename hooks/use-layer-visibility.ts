import { useCallback, useEffect, useState } from "react"
import { readStorage, writeStorage } from "@/lib/storage"

export const MAP_LAYERS = [
  { id: "panoramas", storageKey: "show-panorams", labelKey: "panorams" },
  { id: "nodes", storageKey: "show-nodes", labelKey: "nodes" },
  {
    id: "nodeRegions",
    storageKey: "show-nodes-regions",
    labelKey: "nodes_regions",
  },
  { id: "siegeNodes", storageKey: "show-siege", labelKey: "territories" },
  {
    id: "siegeRegions",
    storageKey: "show-siege-regions",
    labelKey: "territories_regions",
  },
] as const

export type MapLayerId = (typeof MAP_LAYERS)[number]["id"]
export type LayerVisibility = Record<MapLayerId, boolean>

const parseBoolean = (value: unknown) =>
  typeof value === "boolean" ? value : null

function readVisibility(): LayerVisibility {
  return Object.fromEntries(
    MAP_LAYERS.map((layer) => [
      layer.id,
      readStorage(layer.storageKey, true, parseBoolean),
    ])
  ) as LayerVisibility
}

/** Видимость слоёв карты; каждый слой хранится под своим ключом localStorage. */
export function useLayerVisibility() {
  const [visibility, setVisibility] = useState(readVisibility)

  useEffect(() => {
    for (const layer of MAP_LAYERS) {
      writeStorage(layer.storageKey, visibility[layer.id])
    }
  }, [visibility])

  const setLayerVisible = useCallback((id: MapLayerId, visible: boolean) => {
    setVisibility((prev) => ({ ...prev, [id]: visible }))
  }, [])

  return [visibility, setLayerVisible] as const
}
