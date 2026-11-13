"use client"

import "@/lib/i18n"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

/** Подключает i18next и синхронизирует язык документа и заголовок вкладки. */
function I18nProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage

  useEffect(() => {
    if (language) document.documentElement.lang = language
    document.title = t("site_title")
  }, [language, t])

  return children
}

export { I18nProvider }
