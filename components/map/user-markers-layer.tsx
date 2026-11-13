"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Marker } from "react-leaflet"
import { Lock, LockOpen, Trash2, X } from "lucide-react"
import type { UserMarker } from "@/types/map"
import { getMarkerIcon } from "@/lib/map/icons"
import { MARKER_TYPES, isMarkerType } from "@/lib/map/markers"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ColorSelect } from "@/components/map/color-select"
import { IconSelect } from "@/components/map/icon-select"

type MarkerUpdate = Partial<Omit<UserMarker, "id">>

interface UserMarkersLayerProps {
  markers: UserMarker[]
  onUpdateMarker: (id: number, updates: MarkerUpdate) => void
  onDeleteMarker: (id: number) => void
}

interface MenuState {
  isOpen: boolean
  x: number
  y: number
  markerId: number | null
}

const CLOSED_MENU: MenuState = { isOpen: false, x: 0, y: 0, markerId: null }

function UserMarkersLayer({
  markers,
  onUpdateMarker,
  onDeleteMarker,
}: UserMarkersLayerProps) {
  const [menu, setMenu] = useState<MenuState>(CLOSED_MENU)

  const activeMarker = markers.find((m) => m.id === menu.markerId)

  return (
    <>
      <DropdownMenu
        open={menu.isOpen && !!activeMarker}
        onOpenChange={(open) => setMenu((prev) => ({ ...prev, isOpen: open }))}
      >
        {/* Невидимый якорь в точке клика: меню открывается рядом с маркером. */}
        <DropdownMenuTrigger asChild>
          <div
            className="pointer-events-none invisible fixed size-px"
            style={{ left: menu.x, top: menu.y }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={16}
          className="z-1500 w-auto bg-popover/80 backdrop-blur"
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {activeMarker && (
            <MarkerEditor
              marker={activeMarker}
              onUpdate={(updates) => onUpdateMarker(activeMarker.id, updates)}
              onDelete={() => {
                onDeleteMarker(activeMarker.id)
                setMenu(CLOSED_MENU)
              }}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          pmIgnore
          draggable={marker.draggable}
          icon={getMarkerIcon(
            marker,
            menu.isOpen && menu.markerId === marker.id
          )}
          eventHandlers={{
            contextmenu: (e) => {
              e.originalEvent.stopPropagation()
              const { clientX, clientY } = e.originalEvent
              setMenu((prev) => ({
                isOpen: !prev.isOpen,
                x: clientX,
                y: clientY,
                markerId: marker.id,
              }))
            },
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng()
              onUpdateMarker(marker.id, { position: { lat, lng } })
            },
          }}
        />
      ))}
    </>
  )
}

interface MarkerEditorProps {
  marker: UserMarker
  onUpdate: (updates: MarkerUpdate) => void
  onDelete: () => void
}

function MarkerEditor({ marker, onUpdate, onDelete }: MarkerEditorProps) {
  const { t } = useTranslation()

  return (
    <>
      <ColorSelect
        className="p-1"
        color={marker.color}
        setColor={(color) => onUpdate({ color })}
      />
      <DropdownMenuSeparator />
      <IconSelect
        className="p-1"
        icon={marker.icon}
        setIcon={(icon) => onUpdate({ icon })}
      />
      <DropdownMenuSeparator />
      <div className="relative">
        <Input
          placeholder={t("marker_placeholder")}
          value={marker.tooltip}
          onChange={(e) => onUpdate({ tooltip: e.target.value })}
        />
        <button
          className="absolute top-1/2 right-0 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded opacity-50 transition-opacity hover:opacity-100"
          type="button"
          title={t("clear")}
          aria-label={t("clear")}
          onClick={() => onUpdate({ tooltip: "" })}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <DropdownMenuSeparator />
      <ToggleGroup
        variant="outline"
        size="sm"
        type="single"
        className="grid w-full grid-cols-3"
        value={String(marker.type)}
        onValueChange={(value) => {
          const type = Number(value)
          if (isMarkerType(type)) onUpdate({ type })
        }}
      >
        {MARKER_TYPES.map(({ type, langKey }) => (
          <ToggleGroupItem key={type} value={String(type)}>
            {t(langKey)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <DropdownMenuSeparator />
      <ButtonGroup className="grid w-full grid-cols-2">
        <Button
          className="group"
          variant="outline"
          size="sm"
          data-state={marker.draggable ? "active" : "inactive"}
          title={marker.draggable ? t("lock") : t("unlock")}
          aria-label={marker.draggable ? t("lock") : t("unlock")}
          onClick={() => onUpdate({ draggable: !marker.draggable })}
        >
          {marker.draggable ? (
            <LockOpen className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          title={t("delete")}
          aria-label={t("delete")}
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      </ButtonGroup>
    </>
  )
}

export { UserMarkersLayer }
