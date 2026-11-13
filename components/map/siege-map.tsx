"use client"

import "leaflet/dist/leaflet.css"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import type { MarkerType } from "@/types/map"
import { nodes, panoramas, siegeNodes } from "@/data"
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAX_BOUNDS,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_BOUNDS,
  TILE_PROVIDER_URL,
  TILE_URL,
} from "@/lib/map/constants"
import {
  createCameraIcon,
  createCastleIcon,
  createNodeIcon,
} from "@/lib/map/icons"
import { useMarkers } from "@/hooks/use-markers"
import { useLayerVisibility } from "@/hooks/use-layer-visibility"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu"
import {
  NodeMarkersLayer,
  RegionHighlightLayer,
} from "@/components/map/node-layers"
import { UserMarkersLayer } from "@/components/map/user-markers-layer"
import { GeomanControl } from "@/components/map/geoman-control"
import { RulerControl } from "@/components/map/ruler-control"
import { AddMarkerMenu } from "@/components/map/add-marker-menu"
import { SettingsPanel } from "@/components/map/settings-panel"
import { ImportExportDialog } from "@/components/map/import-export-dialog"
import { PanoramaDialog } from "@/components/map/panorama-dialog"

const parseNodeId = (value: unknown) =>
  typeof value === "number" ? value : null

function SiegeMap() {
  const { t } = useTranslation()
  const { markers, addMarker, updateMarker, removeMarker, replaceMarkers } =
    useMarkers()
  const [layers, setLayerVisible] = useLayerVisibility()
  const [selectedNodeId, setSelectedNodeId] = usePersistentState<number | null>(
    "selected-node",
    null,
    parseNodeId
  )

  const [panoramaId, setPanoramaId] = useState<number | null>(null)
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)
  const [rulerActive, setRulerActive] = useState(false)
  const [rulerPoints, setRulerPoints] = useState<L.LatLng[]>([])
  // Точка последнего правого клика; ref, т.к. от неё ничего не рендерится.
  const contextMenuLatLng = useRef<L.LatLng | null>(null)

  const handleMapContextMenu = useCallback((latlng: L.LatLng) => {
    contextMenuLatLng.current = latlng
  }, [])

  const handleNodeClick = useCallback(
    (nodeId: number) =>
      setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId)),
    [setSelectedNodeId]
  )

  const handleAddMarker = (
    type: MarkerType,
    draft: { color: number | null; icon: string | null; tooltip: string }
  ) => {
    const latlng = contextMenuLatLng.current
    if (!latlng) return
    addMarker({
      type,
      position: { lat: latlng.lat, lng: latlng.lng },
      draggable: true,
      ...draft,
    })
  }

  const toggleRuler = () => {
    if (rulerActive) setRulerPoints([])
    setRulerActive(!rulerActive)
  }

  return (
    <div className="relative">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="h-screen w-screen">
            <MapContainer
              crs={L.CRS.Simple}
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              maxBounds={MAX_BOUNDS}
              maxBoundsViscosity={1.0}
              doubleClickZoom={false}
              className="h-screen w-screen"
            >
              <MapEvents onContextMenu={handleMapContextMenu} />
              <GeomanControl />
              <RulerControl
                active={rulerActive}
                points={rulerPoints}
                setPoints={setRulerPoints}
              />
              {layers.panoramas && (
                <NodeMarkersLayer
                  nodes={panoramas}
                  createIcon={createCameraIcon}
                  onNodeClick={setPanoramaId}
                />
              )}
              {layers.nodeRegions && (
                <RegionHighlightLayer
                  nodes={nodes}
                  selectedNodeId={selectedNodeId}
                />
              )}
              {layers.nodes && (
                <NodeMarkersLayer
                  nodes={nodes}
                  createIcon={createNodeIcon}
                  onNodeClick={handleNodeClick}
                />
              )}
              {layers.siegeRegions && (
                <RegionHighlightLayer
                  nodes={siegeNodes}
                  selectedNodeId={selectedNodeId}
                  dashed
                />
              )}
              {layers.siegeNodes && (
                <NodeMarkersLayer
                  nodes={siegeNodes}
                  createIcon={createCastleIcon}
                  onNodeClick={handleNodeClick}
                />
              )}
              <UserMarkersLayer
                markers={markers}
                onUpdateMarker={updateMarker}
                onDeleteMarker={removeMarker}
              />
              <TileLayer
                noWrap
                bounds={TILE_BOUNDS}
                attribution={`${t("map_provider")} <a href="${TILE_PROVIDER_URL}" target="_blank" rel="noopener">nodewar.gg</a>`}
                url={TILE_URL}
              />
            </MapContainer>
          </div>
        </ContextMenuTrigger>
        <AddMarkerMenu
          rulerActive={rulerActive}
          onToggleRuler={toggleRuler}
          onAddMarker={handleAddMarker}
        />
      </ContextMenu>

      <SettingsPanel
        visibility={layers}
        onLayerToggle={setLayerVisible}
        onClearMarkers={() => replaceMarkers([])}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      />
      <PanoramaDialog
        panorama={panoramas.find((p) => p.id === panoramaId)}
        onClose={() => setPanoramaId(null)}
      />
      <ImportExportDialog
        open={isImportExportOpen}
        onOpenChange={setIsImportExportOpen}
        markers={markers}
        onImport={replaceMarkers}
      />
    </div>
  )
}

/** Мелкая настройка карты и перехват правого клика для контекстного меню. */
function MapEvents({
  onContextMenu,
}: {
  onContextMenu: (latlng: L.LatLng) => void
}) {
  const map = useMap()

  useEffect(() => {
    // Убираем префикс «Leaflet» с флагом: https://github.com/Leaflet/Leaflet/pull/8109
    map.attributionControl?.setPrefix("")
  }, [map])

  useEffect(() => {
    const container = map.getContainer()
    const handleContextMenu = (e: MouseEvent) =>
      onContextMenu(map.mouseEventToLatLng(e))

    container.addEventListener("contextmenu", handleContextMenu)
    return () => container.removeEventListener("contextmenu", handleContextMenu)
  }, [map, onContextMenu])

  return null
}

export { SiegeMap }
