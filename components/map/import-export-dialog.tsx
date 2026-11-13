"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import type { UserMarker } from "@/types/map"
import { decodeShareCode, encodeShareCode } from "@/lib/map/share-code"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface ImportExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  markers: UserMarker[]
  onImport: (markers: UserMarker[]) => void
}

function ImportExportDialog({
  open,
  onOpenChange,
  markers,
  onImport,
}: ImportExportDialogProps) {
  const { t } = useTranslation()
  const [importCode, setImportCode] = useState("")
  const [importError, setImportError] = useState(false)
  const [importCount, setImportCount] = useState(0)
  const [copyCount, setCopyCount] = useState(0)
  const [exportCode, setExportCode] = useState("")

  useEffect(() => {
    if (!open) return
    let cancelled = false
    encodeShareCode(markers).then((code) => {
      if (!cancelled) setExportCode(code)
    })
    return () => {
      cancelled = true
    }
  }, [open, markers])

  const latestImport = useRef("")

  const handleImport = async (value: string) => {
    latestImport.current = value
    setImportCode(value)
    setImportError(false)
    if (!value.trim()) return

    const imported = await decodeShareCode(value)
    // Пока шло декодирование, поле могли изменить — результат устарел.
    if (latestImport.current !== value) return

    if (imported) {
      onImport(imported)
      setImportCode("")
      setImportCount((n) => n + 1)
    } else {
      setImportError(true)
    }
  }

  const handleCopy = async (input: HTMLInputElement) => {
    input.select()
    try {
      await navigator.clipboard.writeText(exportCode)
      setCopyCount((n) => n + 1)
    } catch {
      // Буфер обмена недоступен — текст остаётся выделенным для ручного копирования.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("import_export")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("import_export")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <div className="flex flex-row items-end justify-between">
            <FieldLabel htmlFor="import-code" className="text-muted-foreground">
              {t("import")}
            </FieldLabel>
            {importError ? (
              <span className="text-xs text-destructive">
                {t("import_error")}
              </span>
            ) : (
              importCount > 0 && (
                <FlashMessage key={importCount} text={t("import_alert")} />
              )
            )}
          </div>
          <Input
            id="import-code"
            placeholder={t("import_placeholder")}
            className="truncate text-xs"
            value={importCode}
            aria-invalid={importError}
            onChange={(e) => handleImport(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <div className="flex flex-row items-end justify-between">
            <FieldLabel htmlFor="export-code" className="text-muted-foreground">
              {t("export")}
            </FieldLabel>
            {copyCount > 0 && (
              <FlashMessage key={copyCount} text={t("export_alert")} />
            )}
          </div>
          <Input
            id="export-code"
            readOnly
            value={exportCode}
            className="cursor-pointer truncate text-xs"
            onClick={(e) => handleCopy(e.currentTarget)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FlashMessage({ text }: { text: string }) {
  return (
    <span className="animate-flash text-xs text-muted-foreground">{text}</span>
  )
}

export { ImportExportDialog }
