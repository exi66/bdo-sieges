"use client"

import "@/i18n"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

function I18nProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = i18n.language
      document.title = t("site_title")
    }
  }, [i18n.language, t])

  return <>{children}</>
}

export { I18nProvider }
