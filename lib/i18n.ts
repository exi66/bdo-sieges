import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import ru from "@/messages/ru.json"
import en from "@/messages/en.json"

export const SUPPORTED_LANGUAGES = ["ru", "en"] as const
export const DEFAULT_LANGUAGE = "ru"

// `lng` намеренно не задан: иначе детектор игнорирует сохранённый выбор
// пользователя и язык браузера.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: DEFAULT_LANGUAGE,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
