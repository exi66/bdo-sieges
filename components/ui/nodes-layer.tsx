"use client"

import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import { Polygon, Marker, useMap } from "react-leaflet"
import { mapConverter, markerTypes } from "@/map/utils"
import {
  createCustomNodeIcon,
  createCustomCastleIcon,
  createCustomFlagIcon,
  createCustomFortressIcon,
  createCustomPinIcon,
} from "@/map/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColorSelect } from "@/components/ui/color-select"
import { IconSelect } from "@/components/ui/icon-select"
import { Input } from "@/components/ui/input"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import { Lock, LockOpen, Trash2, X } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getCssVar } from "@/lib/utils"

interface RegionsProps {
  nodes: NodesData
  selectedNodeId: number | null
}

interface NodesProps {
  nodes: NodesData
  onNodeClick: (nodeId: number) => void
}

function RegionsLayer({ nodes, selectedNodeId }: RegionsProps) {
  const map = useMap()

  const activePolygon = useMemo(() => {
    const node = nodes.find((n) => n.id === selectedNodeId)
    if (!node || !node.polygon) return null

    const positions = node.polygon.map((pt) => {
      const [x, y] = mapConverter.convert(
        [Number(pt.x), Number(pt.y)],
        "kr",
        "sl2"
      )
      return map.unproject([x, y], map.getMaxZoom())
    })

    return {
      id: node.id,
      positions,
    }
  }, [nodes, selectedNodeId, map])

  if (!activePolygon) return null

  return (
    <Polygon
      key={activePolygon.id}
      positions={activePolygon.positions}
      interactive={false}
      pathOptions={{
        color: getCssVar("--chart-7"),
        fillColor: getCssVar("--chart-7"),
        weight: 2,
        fillOpacity: 0.1,
        pmIgnore: true,
      }}
    />
  )
}

function NodesLayer({ nodes, onNodeClick }: NodesProps) {
  const map = useMap()
  const maxZoom = map.getMaxZoom()

  const nodesList = useMemo(() => {
    return nodes.map((node) => {
      const [x, y] = mapConverter.convert(
        [Number(node.location.x), Number(node.location.y)],
        "kr",
        "sl2"
      )

      return {
        id: node.id,
        location: node.location,
        position: map.unproject([x, y], maxZoom),
        icon: createCustomNodeIcon(node),
        name: node.name,
      }
    })
  }, [nodes, map, maxZoom])

  return (
    <>
      {nodesList.map((node) => (
        <Marker
          key={node.id}
          position={node.position}
          icon={node.icon}
          pmIgnore={true}
          eventHandlers={{
            click: () => {
              onNodeClick(node.id)
            },
          }}
        />
      ))}
    </>
  )
}

function SiegeNodesLayer({ nodes, onNodeClick }: NodesProps) {
  const map = useMap()
  const maxZoom = map.getMaxZoom()

  const nodesList = useMemo(() => {
    return nodes.map((node) => {
      const [x, y] = mapConverter.convert(
        [Number(node.location.x), Number(node.location.y)],
        "kr",
        "sl2"
      )

      return {
        id: node.id,
        location: node.location,
        position: map.unproject([x, y], maxZoom),
        icon: createCustomCastleIcon(node),
        name: node.name,
      }
    })
  }, [nodes, map, maxZoom])

  return (
    <>
      {nodesList.map((node) => (
        <Marker
          key={node.id}
          position={node.position}
          icon={node.icon}
          pmIgnore={true}
          eventHandlers={{
            click: () => {
              onNodeClick(node.id)
            },
          }}
        />
      ))}
    </>
  )
}

function SiegeRegionsLayer({ nodes, selectedNodeId }: RegionsProps) {
  const map = useMap()

  const activePolygon = useMemo(() => {
    const node = nodes.find((n) => n.id === selectedNodeId)
    if (!node || !node.polygon) return null

    const positions = node.polygon.map((pt) => {
      const [x, y] = mapConverter.convert(
        [Number(pt.x), Number(pt.y)],
        "kr",
        "sl2"
      )
      return map.unproject([x, y], map.getMaxZoom())
    })

    return {
      id: node.id,
      positions,
    }
  }, [nodes, selectedNodeId, map])

  if (!activePolygon) return null

  return (
    <Polygon
      key={activePolygon.id}
      positions={activePolygon.positions}
      interactive={false}
      pathOptions={{
        color: getCssVar("--chart-7"),
        fillColor: getCssVar("--chart-7"),
        fillOpacity: 0.1,
        weight: 2,
        dashArray: [10, 10],
        pmIgnore: true,
      }}
    />
  )
}

interface UserMarkersLayerProps {
  markers: UserMarker[]
  onUpdateMarker: (id: number, updates: Partial<UserMarker>) => void
  onDeleteMarker: (id: number) => void
}

function UserMarkersLayer({
  markers,
  onUpdateMarker,
  onDeleteMarker,
}: UserMarkersLayerProps) {
  const [menuData, setMenuData] = useState<{
    isOpen: boolean
    x: number
    y: number
    markerId: number | null
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    markerId: null,
  })

  const { t } = useTranslation()

  const activeMarker = useMemo(
    () => markers.find((m) => m.id === menuData.markerId),
    [markers, menuData.markerId]
  )

  const getMarkerIcon = (marker: UserMarker, isActive: boolean) => {
    switch (marker.type) {
      case 0:
        return createCustomFortressIcon(
          marker.color,
          marker.icon,
          marker.tooltip,
          isActive
        )
      case 1:
        return createCustomFlagIcon(
          marker.color,
          marker.icon,
          marker.tooltip,
          isActive
        )
      default:
        return createCustomPinIcon(
          marker.color,
          marker.icon,
          marker.tooltip,
          isActive
        )
    }
  }

  return (
    <>
      <DropdownMenu
        open={menuData.isOpen}
        onOpenChange={(open) =>
          setMenuData((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DropdownMenuTrigger asChild>
          <div
            style={{
              position: "fixed",
              left: menuData.x,
              top: menuData.y,
              width: "1px",
              height: "1px",
              pointerEvents: "none",
              visibility: "hidden",
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="center"
          className="z-1500 w-auto bg-popover/80 backdrop-blur"
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {!activeMarker ? (
            <div className="p-2 text-center text-xs opacity-50">
              {t("loading")}
            </div>
          ) : (
            <>
              <ColorSelect
                className="p-1"
                color={activeMarker.color}
                setColor={(newColor) =>
                  onUpdateMarker(activeMarker.id, { color: Number(newColor) })
                }
              />
              <DropdownMenuSeparator />
              <IconSelect
                className="p-1"
                icon={activeMarker.icon}
                setIcon={(newIcon) =>
                  onUpdateMarker(activeMarker.id, { icon: String(newIcon) })
                }
              />
              <DropdownMenuSeparator />
              <div className="relative">
                <Input
                  placeholder={t("marker_placeholder")}
                  value={activeMarker.tooltip || ""}
                  onChange={(e) =>
                    onUpdateMarker(activeMarker.id, { tooltip: e.target.value })
                  }
                />
                <button
                  className="absolute top-1/2 right-0 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded opacity-50 transition-opacity hover:opacity-100"
                  type="button"
                  title={t("clear")}
                  onClick={() =>
                    onUpdateMarker(activeMarker.id, { tooltip: "" })
                  }
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <DropdownMenuSeparator />
              <ToggleGroup
                variant="outline"
                type="single"
                className="grid w-full grid-cols-3"
                value={String(activeMarker.type)}
                onValueChange={(value) =>
                  onUpdateMarker(activeMarker.id, { type: Number(value) })
                }
              >
                {markerTypes.map((type) => (
                  <ToggleGroupItem key={type.type} value={String(type.type)}>
                    {t(type.lang_key)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <DropdownMenuSeparator />
              <ButtonGroup className="grid w-full grid-cols-2">
                <Button
                  className="group"
                  variant="outline"
                  size="sm"
                  data-state={activeMarker.draggable ? "active" : "inactive"}
                  title={activeMarker.draggable ? t("lock") : t("unlock")}
                  onClick={() =>
                    onUpdateMarker(activeMarker.id, {
                      draggable: !activeMarker.draggable,
                    })
                  }
                >
                  {activeMarker.draggable ? (
                    <LockOpen className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  title={t("delete")}
                  onClick={() => onDeleteMarker(activeMarker.id)}
                >
                  <Trash2 />
                </Button>
              </ButtonGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {markers.map((marker) => {
        const isActive = menuData.isOpen && menuData.markerId === marker.id

        return (
          <Marker
            key={marker.id}
            position={marker.position}
            pmIgnore={true}
            draggable={marker.draggable}
            icon={getMarkerIcon(marker, isActive)}
            eventHandlers={{
              contextmenu: (e) => {
                e.originalEvent.stopPropagation()

                setMenuData({
                  isOpen: !menuData.isOpen,
                  x: e.originalEvent.clientX,
                  y: e.originalEvent.clientY,
                  markerId: marker.id,
                })
              },
              // click: (e) => {
              //   e.originalEvent.stopPropagation()
              //   setMenuData({
              //     isOpen: true,
              //     x: e.originalEvent.clientX,
              //     y: e.originalEvent.clientY,
              //     markerId: marker.id,
              //   })
              // },
              dragend: (e) => {
                const latlng = e.target.getLatLng()
                onUpdateMarker(marker.id, { position: latlng })
              },
            }}
          />
        )
      })}
    </>
  )
}

export {
  RegionsLayer,
  NodesLayer,
  SiegeRegionsLayer,
  SiegeNodesLayer,
  UserMarkersLayer,
}
