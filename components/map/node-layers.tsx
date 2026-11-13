"use client"

import { useMemo } from "react"
import { Marker, Polygon, useMap } from "react-leaflet"
import type { DivIcon, LatLng, LatLngExpression } from "leaflet"
import type { GamePoint, MapNode } from "@/types/map"
import { gameToPixel } from "@/lib/map/coordinates"
import { MAX_ZOOM, WORLD_RING } from "@/lib/map/constants"

/** Перевод игровых координат в LatLng карты. */
function useGameToLatLng() {
  const map = useMap()
  return useMemo(
    () => (point: GamePoint, isNew?: boolean) =>
      map.unproject(gameToPixel(point, isNew), MAX_ZOOM),
    [map]
  )
}

interface NodeLike {
  id: number
  location: GamePoint
  new?: boolean
}

interface NodeMarkersLayerProps<T extends NodeLike> {
  nodes: T[]
  createIcon: (node: T) => DivIcon
  onNodeClick: (nodeId: number) => void
}

/** Слой кликабельных маркеров для узлов, территорий и панорам. */
function NodeMarkersLayer<T extends NodeLike>({
  nodes,
  createIcon,
  onNodeClick,
}: NodeMarkersLayerProps<T>) {
  const toLatLng = useGameToLatLng()

  const items = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        position: toLatLng(node.location, node.new),
        icon: createIcon(node),
      })),
    [nodes, createIcon, toLatLng]
  )

  return items.map((item) => (
    <Marker
      key={item.id}
      position={item.position}
      icon={item.icon}
      pmIgnore
      eventHandlers={{ click: () => onNodeClick(item.id) }}
    />
  ))
}

interface RegionHighlightLayerProps {
  nodes: MapNode[]
  selectedNodeId: number | null
  dashed?: boolean
}

/** Затемняет всё, кроме выбранного региона, и обводит его контур. */
function RegionHighlightLayer({
  nodes,
  selectedNodeId,
  dashed = false,
}: RegionHighlightLayerProps) {
  const toLatLng = useGameToLatLng()

  const region = useMemo(() => {
    const node = nodes.find((n) => n.id === selectedNodeId)
    if (!node?.polygon?.length) return null

    const outline: LatLng[] = node.polygon.map((pt) => toLatLng(pt, node.new))
    return {
      id: node.id,
      outline,
      mask: [WORLD_RING, outline] as LatLngExpression[][],
    }
  }, [nodes, selectedNodeId, toLatLng])

  if (!region) return null

  // Цвета задаются CSS-классами, чтобы следовать за сменой темы.
  // className и pmIgnore читаются только при создании слоя, поэтому
  // передаются отдельными props, а не через pathOptions (там — setStyle).
  return (
    <>
      <Polygon
        key={`${region.id}-mask`}
        positions={region.mask}
        interactive={false}
        className="map-region-mask"
        pmIgnore
        pathOptions={{
          stroke: false,
          fillOpacity: 0.5,
        }}
      />
      <Polygon
        key={`${region.id}-outline`}
        positions={region.outline}
        interactive={false}
        className="map-region-outline"
        pmIgnore
        pathOptions={{
          weight: 2,
          fill: false,
          dashArray: dashed ? [10, 10] : undefined,
        }}
      />
    </>
  )
}

export { NodeMarkersLayer, RegionHighlightLayer }
