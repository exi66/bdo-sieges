"use client"

import "leaflet/dist/leaflet.css"
import { useTranslation } from "react-i18next"
import { useEffect, useState, useCallback } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import { nodes } from "@/map/nodes"
import { panorams } from "@/map/panorams"
import { siegeNodes } from "@/map/siege-nodes"
import {
  RegionsLayer,
  NodesLayer,
  SiegeRegionsLayer,
  SiegeNodesLayer,
  UserMarkersLayer,
  PanoramsLayer,
} from "@/components/ui/nodes-layer"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { GeomanControl, RulerControl } from "@/components/ui/geoman-control"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  ContextMenu,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogDescription,
} from "@/components/ui/dialog"
import { ColorSelect } from "@/components/ui/color-select"
import { IconSelect } from "@/components/ui/icon-select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMapSync } from "@/hooks/useMapSync"
import { markerTypes } from "@/map/utils"
import { LangToggle } from "@/components/ui/lang-toggle"
import { Pannellum } from "./pannellum"

const getStorageValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue
  const saved = localStorage.getItem(key)
  try {
    return saved !== null ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}

function InitMap({
  onContextMenu,
}: {
  onContextMenu: (latlng: L.LatLng) => void
}) {
  const map = useMap()

  useEffect(() => {
    if (map.attributionControl) {
      //https://github.com/Leaflet/Leaflet/pull/8109
      map.attributionControl.setPrefix("")
    }
  }, [map])

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const latlng = map.mouseEventToLatLng(e)
      onContextMenu(latlng)
    }

    const container = map.getContainer()
    container.addEventListener("contextmenu", handleContextMenu)

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [map, onContextMenu])

  return null
}

function Map() {
  const { t } = useTranslation()

  const [selectPanoramaId, setPanoramaId] = useState<number | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [clickedCoords, setClickedCoords] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(() =>
    getStorageValue("selected-node", null)
  )
  const [showNodes, setShowNodes] = useState(() =>
    getStorageValue("show-nodes", true)
  )
  const [showNodesRegions, setShowNodesRegions] = useState(() =>
    getStorageValue("show-nodes-regions", true)
  )
  const [showSiegeNodes, setShowSiegeNodes] = useState(() =>
    getStorageValue("show-siege", true)
  )
  const [showSiegeNodesRegions, setShowSiegeNodesRegions] = useState(() =>
    getStorageValue("show-siege-regions", true)
  )
  const [showPanoramNodes, setPanoramNodes] = useState(() =>
    getStorageValue("show-panorams", true)
  )
  const {
    data: userMarkers,
    setData: setUserMarkers,
    importData,
    exportData,
  } = useMapSync<UserMarker>("markers")
  const [copyTrigger, setCopyTrigger] = useState(0)
  const [importTrigger, setImportTrigger] = useState(0)

  const [rulerActive, setRulerActive] = useState(false)
  const [rulerPoints, setRulerPoints] = useState<L.LatLng[]>([])

  const handleNodeClick = (nodeId: number) => {
    setSelectedNodeId((prevId) => (prevId === nodeId ? null : nodeId))
  }

  const handleUpdateMarker = (id: number, updates: Partial<UserMarker>) => {
    const updated = userMarkers.map((marker) =>
      marker.id === id ? { ...marker, ...updates } : marker
    )
    setUserMarkers(updated)
  }

  const handleDeleteMarker = (id: number) => {
    const filtered = userMarkers.filter((marker) => marker.id !== id)
    setUserMarkers(filtered)
  }

  const [color, setColor] = useState<number | null>(1)
  const [icon, setIcon] = useState<string | null>("icon-empty")
  const [tooltipText, setTooltipText] = useState("")

  const handleAddMarker = useCallback(
    (type: number) => {
      if (!clickedCoords) return

      const newMarker: UserMarker = {
        id: Date.now(),
        type,
        position: { lat: clickedCoords.lat, lng: clickedCoords.lng },
        color: color,
        icon: icon,
        tooltip: tooltipText,
        draggable: true,
      }

      setUserMarkers([...userMarkers, newMarker])
      setTooltipText("")
    },
    [clickedCoords, color, icon, tooltipText, userMarkers, setUserMarkers]
  )

  useEffect(() => {
    localStorage.setItem("selected-node", JSON.stringify(selectedNodeId))
  }, [selectedNodeId])

  useEffect(() => {
    localStorage.setItem("show-nodes", JSON.stringify(showNodes))
  }, [showNodes])

  useEffect(() => {
    localStorage.setItem("show-nodes-regions", JSON.stringify(showNodesRegions))
  }, [showNodesRegions])

  useEffect(() => {
    localStorage.setItem("show-siege", JSON.stringify(showSiegeNodes))
  }, [showSiegeNodes])

  useEffect(() => {
    localStorage.setItem(
      "show-siege-regions",
      JSON.stringify(showSiegeNodesRegions)
    )
  }, [showSiegeNodesRegions])

  useEffect(() => {
    localStorage.setItem("show-panorams", JSON.stringify(showPanoramNodes))
  }, [showPanoramNodes])

  const activePanoramData = panorams.find((p) => p.id === selectPanoramaId)

  const SettingsContent = (
    <div className="space-y-4">
      <FieldSet className="min-w-32">
        <FieldLegend variant="label">{t("language")}</FieldLegend>
        <LangToggle />
      </FieldSet>
      <FieldSet className="min-w-32">
        <FieldLegend variant="label">{t("layers")}</FieldLegend>
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <Checkbox
              id="show-panorams-checkbox"
              checked={showPanoramNodes}
              onCheckedChange={(checked) => setPanoramNodes(checked === true)}
            />
            <FieldLabel
              htmlFor="show-panorams-checkbox"
              className="font-normal"
            >
              {t("panorams")}
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="show-nodes-checkbox"
              checked={showNodes}
              onCheckedChange={(checked) => setShowNodes(checked === true)}
            />
            <FieldLabel htmlFor="show-nodes-checkbox" className="font-normal">
              {t("nodes")}
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="show-nodes-regions-checkbox"
              checked={showNodesRegions}
              onCheckedChange={(checked) =>
                setShowNodesRegions(checked === true)
              }
            />
            <FieldLabel
              htmlFor="show-nodes-regions-checkbox"
              className="font-normal"
            >
              {t("nodes_regions")}
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="show-siege-nodes-checkbox"
              checked={showSiegeNodes}
              onCheckedChange={(checked) => setShowSiegeNodes(checked === true)}
            />
            <FieldLabel
              htmlFor="show-siege-nodes-checkbox"
              className="font-normal"
            >
              {t("territories")}
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="show-siege-regions-checkbox"
              checked={showSiegeNodesRegions}
              onCheckedChange={(checked) =>
                setShowSiegeNodesRegions(checked === true)
              }
            />
            <FieldLabel
              htmlFor="show-siege-regions-checkbox"
              className="font-normal"
            >
              {t("territories_regions")}
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSet className="min-w-32">
        <FieldLegend variant="label">{t("controls")}</FieldLegend>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              confirm(t("clear_all_confirm")) && setUserMarkers([])
            }
          >
            {t("clear_all")}
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {t("import_export")}
          </Button>
        </div>
      </FieldSet>
    </div>
  )

  return (
    <div className="relative">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="h-screen w-screen">
            <MapContainer
              center={[0, 0]}
              maxZoom={8}
              minZoom={4}
              zoom={4}
              maxBounds={[
                [90, -180],
                [-90, 180],
              ]}
              maxBoundsViscosity={1.0}
              doubleClickZoom={false}
              className="h-screen w-screen"
            >
              <InitMap onContextMenu={(latlng) => setClickedCoords(latlng)} />
              <GeomanControl />
              <RulerControl
                active={rulerActive}
                points={rulerPoints}
                setPoints={setRulerPoints}
              />
              {showPanoramNodes && (
                <PanoramsLayer nodes={panorams} onNodeClick={setPanoramaId} />
              )}
              {showNodesRegions && (
                <RegionsLayer nodes={nodes} selectedNodeId={selectedNodeId} />
              )}
              {showNodes && (
                <NodesLayer nodes={nodes} onNodeClick={handleNodeClick} />
              )}
              {showSiegeNodesRegions && (
                <SiegeRegionsLayer
                  nodes={siegeNodes}
                  selectedNodeId={selectedNodeId}
                />
              )}
              {showSiegeNodes && (
                <SiegeNodesLayer
                  nodes={siegeNodes}
                  onNodeClick={handleNodeClick}
                />
              )}
              <UserMarkersLayer
                markers={userMarkers}
                onUpdateMarker={handleUpdateMarker}
                onDeleteMarker={handleDeleteMarker}
              />
              <TileLayer
                noWrap={true}
                bounds={[
                  [90, -180],
                  [-90, 180],
                ]}
                attribution={`${t("map_provider")} <a href="https://nodewar.gg/" target="_blank">nodewar.gg</a>`}
                url="https://storage.nodewar.gg/map/tiles/{z}/{x}_{y}.webp"
              />
            </MapContainer>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="z-1500 bg-popover/80 backdrop-blur">
          <Button
            className="w-full justify-start px-1.5 text-sm font-normal"
            size={"sm"}
            variant={rulerActive ? "default" : "ghost"}
            onClick={() => {
              if (rulerActive) setRulerPoints([])
              setRulerActive(!rulerActive)
            }}
          >
            {t("tool_ruler")}
          </Button>
          {markerTypes.map((mt) => (
            <ContextMenuSub key={mt.type}>
              <ContextMenuSubTrigger>{t(mt.lang_key)}</ContextMenuSubTrigger>
              <ContextMenuPortal container={document.body}>
                <ContextMenuSubContent className="z-1500 bg-popover/80 backdrop-blur">
                  <ColorSelect
                    color={color}
                    setColor={setColor}
                    className="p-1"
                  />
                  <ContextMenuSeparator />
                  <IconSelect icon={icon} setIcon={setIcon} className="p-1" />
                  <ContextMenuSeparator />
                  <Input
                    placeholder={t("marker_placeholder")}
                    value={tooltipText}
                    onChange={(e) => setTooltipText(e.target.value)}
                  />
                  <ContextMenuSeparator />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddMarker(mt.type)}
                  >
                    {t("add")} {t(mt.lang_key).toLowerCase()}
                  </Button>
                </ContextMenuSubContent>
              </ContextMenuPortal>
            </ContextMenuSub>
          ))}
        </ContextMenuContent>
      </ContextMenu>
      <div className="absolute top-2.5 right-2.5 z-1500 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="bg-popover/80 shadow backdrop-blur">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="z-2000 w-72 overflow-y-auto bg-popover/95 p-4 backdrop-blur">
            <SheetTitle className="mb-4">{t("settings")}</SheetTitle>
            <SheetDescription className="sr-only">
              Map layer and language controls
            </SheetDescription>
            {SettingsContent}
          </SheetContent>
        </Sheet>
      </div>
      <div className="absolute top-2.5 right-2.5 z-1500 hidden w-56 rounded-lg border bg-popover/80 p-4 text-sm text-popover-foreground shadow backdrop-blur lg:block">
        {SettingsContent}
      </div>
      <Dialog
        open={!!selectPanoramaId}
        onOpenChange={(open) => !open && setPanoramaId(null)}
      >
        <DialogTitle className="sr-only">{t("panorams")}</DialogTitle>
        <DialogDescription className="sr-only">
          {activePanoramData?.name}
        </DialogDescription>
        <DialogContent className="h-screen max-w-full overflow-hidden rounded-none p-0 sm:h-[calc(100vh-6rem)] sm:max-w-[calc(100%-6rem)] sm:rounded-lg">
          {activePanoramData && <Pannellum image={activePanoramData.image} />}
        </DialogContent>
      </Dialog>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogPortal container={document.body}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("import_export")}</DialogTitle>
            </DialogHeader>
            <DialogDescription className="sr-only">
              {t("import_export")}
            </DialogDescription>
            <div className="space-y-1">
              <div className="flex flex-row items-end justify-between">
                <FieldLabel className="text-muted-foreground">
                  {t("import")}
                </FieldLabel>
                {importTrigger > 0 && (
                  <span
                    key={`import-${importTrigger}`}
                    className="animate-flash text-xs text-muted-foreground"
                  >
                    {t("import_alert")}
                  </span>
                )}
              </div>
              <Input
                placeholder={t("import_placeholder")}
                className="truncate text-xs"
                onChange={(e) => {
                  const val = e.target.value.trim()
                  if (val && importData(val)) {
                    setImportTrigger((prev) => prev + 1)
                    setTimeout(() => (e.target.value = ""), 1000)
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <div className="flex flex-row items-end justify-between">
                <FieldLabel className="text-muted-foreground">
                  {t("export")}
                </FieldLabel>
                {copyTrigger > 0 && (
                  <span
                    key={`copy-${copyTrigger}`}
                    className="animate-flash text-xs text-muted-foreground"
                  >
                    {t("export_alert")}
                  </span>
                )}
              </div>
              <Input
                readOnly
                value={exportData()}
                className="cursor-pointer truncate text-xs"
                onClick={(e) => {
                  const el = e.target as HTMLInputElement
                  el.select()
                  navigator.clipboard.writeText(exportData())
                  setCopyTrigger((prev) => prev + 1)
                }}
              />
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  )
}

export { Map }
