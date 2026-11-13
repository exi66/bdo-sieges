"use client"

import { useTranslation } from "react-i18next"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n"

function LangToggle() {
  const { i18n } = useTranslation()

  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      type="single"
      className="w-full"
      value={i18n.resolvedLanguage}
      onValueChange={(value) => value && i18n.changeLanguage(value)}
    >
      {SUPPORTED_LANGUAGES.map((code) => (
        <ToggleGroupItem key={code} value={code} className="grow">
          {code.toUpperCase()}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { LangToggle }
