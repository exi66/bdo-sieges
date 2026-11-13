"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { MarkerType } from "@/types/map"
import { DEFAULT_COLOR, DEFAULT_ICON, MARKER_TYPES } from "@/lib/map/markers"
import type { NewMarker } from "@/hooks/use-markers"
import {
  ContextMenuContent,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ColorSelect } from "@/components/map/color-select"
import { IconSelect } from "@/components/map/icon-select"

type MarkerDraft = Pick<NewMarker, "color" | "icon" | "tooltip">

interface AddMarkerMenuProps {
  rulerActive: boolean
  onToggleRuler: () => void
  onAddMarker: (type: MarkerType, draft: MarkerDraft) => void
}

/** Контекстное меню карты: линейка и добавление маркеров. */
function AddMarkerMenu({
  rulerActive,
  onToggleRuler,
  onAddMarker,
}: AddMarkerMenuProps) {
  const { t } = useTranslation()
  const [color, setColor] = useState<number>(DEFAULT_COLOR)
  const [icon, setIcon] = useState<string>(DEFAULT_ICON)
  const [tooltip, setTooltip] = useState("")

  return (
    <ContextMenuContent className="z-1500 bg-popover/80 backdrop-blur">
      <Button
        className="w-full justify-start px-1.5 text-sm font-normal"
        size="sm"
        variant={rulerActive ? "default" : "ghost"}
        onClick={onToggleRuler}
      >
        {t("tool_ruler")}
      </Button>
      {MARKER_TYPES.map(({ type, langKey }) => (
        <ContextMenuSub key={type}>
          <ContextMenuSubTrigger>{t(langKey)}</ContextMenuSubTrigger>
          <ContextMenuPortal container={document.body}>
            <ContextMenuSubContent className="z-1500 bg-popover/80 backdrop-blur">
              <ColorSelect color={color} setColor={setColor} className="p-1" />
              <ContextMenuSeparator />
              <IconSelect icon={icon} setIcon={setIcon} className="p-1" />
              <ContextMenuSeparator />
              <Input
                placeholder={t("marker_placeholder")}
                value={tooltip}
                onChange={(e) => setTooltip(e.target.value)}
              />
              <ContextMenuSeparator />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  onAddMarker(type, { color, icon, tooltip })
                  setTooltip("")
                }}
              >
                {t("add")} {t(langKey).toLowerCase()}
              </Button>
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>
      ))}
    </ContextMenuContent>
  )
}

export { AddMarkerMenu }
