"use client"

import { useTranslation } from "react-i18next"
import { Menu } from "lucide-react"
import {
  MAP_LAYERS,
  type LayerVisibility,
  type MapLayerId,
} from "@/hooks/use-layer-visibility"
import { LangToggle } from "@/components/lang-toggle"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface SettingsPanelProps {
  visibility: LayerVisibility
  onLayerToggle: (id: MapLayerId, visible: boolean) => void
  onClearMarkers: () => void
  onOpenImportExport: () => void
}

/** Настройки: выезжающая панель на мобильных и плавающая карточка на десктопе. */
function SettingsPanel(props: SettingsPanelProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="absolute top-2.5 right-2.5 z-1500 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="bg-popover/80 shadow backdrop-blur"
              aria-label={t("settings")}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="z-2000 w-72 overflow-y-auto bg-popover/95 p-4 backdrop-blur">
            <SheetTitle className="mb-4">{t("settings")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("settings_description")}
            </SheetDescription>
            <SettingsContent idPrefix="sheet" {...props} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="absolute top-2.5 right-2.5 z-1500 hidden w-56 rounded-lg border bg-popover/80 p-4 text-sm text-popover-foreground shadow backdrop-blur lg:block">
        <SettingsContent idPrefix="panel" {...props} />
      </div>
    </>
  )
}

function SettingsContent({
  idPrefix,
  visibility,
  onLayerToggle,
  onClearMarkers,
  onOpenImportExport,
}: SettingsPanelProps & { idPrefix: string }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <FieldSet className="min-w-32">
        <FieldLegend variant="label">{t("language")}</FieldLegend>
        <LangToggle />
      </FieldSet>
      <FieldSet className="min-w-32">
        <FieldLegend variant="label">{t("layers")}</FieldLegend>
        <FieldGroup className="gap-3">
          {MAP_LAYERS.map((layer) => {
            const id = `${idPrefix}-layer-${layer.id}`
            return (
              <Field key={layer.id} orientation="horizontal">
                <Checkbox
                  id={id}
                  checked={visibility[layer.id]}
                  onCheckedChange={(checked) =>
                    onLayerToggle(layer.id, checked === true)
                  }
                />
                <FieldLabel htmlFor={id} className="font-normal">
                  {t(layer.labelKey)}
                </FieldLabel>
              </Field>
            )
          })}
        </FieldGroup>
      </FieldSet>
      <FieldSet className="min-w-32">
        <FieldLegend variant="label">{t("controls")}</FieldLegend>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => confirm(t("clear_all_confirm")) && onClearMarkers()}
          >
            {t("clear_all")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onOpenImportExport}
          >
            {t("import_export")}
          </Button>
        </div>
      </FieldSet>
    </div>
  )
}

export { SettingsPanel }
