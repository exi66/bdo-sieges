"use client"

import { useTranslation } from "react-i18next"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

function LangToggle() {
  const { i18n } = useTranslation()

  const availableLanguages = Object.keys(i18n.options.resources || {})

  const handleLanguageChange = (value: string) => {
    if (value) i18n.changeLanguage(value)
  }

  return (
    <ToggleGroup
      variant="outline"
      type="single"
      className="w-full"
      value={i18n.language}
      onValueChange={handleLanguageChange}
    >
      {availableLanguages.map((langCode) => (
        <ToggleGroupItem key={langCode} value={langCode} className="grow">
          {langCode.toLocaleUpperCase()}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { LangToggle }
