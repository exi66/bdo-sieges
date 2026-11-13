"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useTranslation } from "react-i18next"
import { Loader2 } from "lucide-react"
import type { PanoramaNode } from "@/types/map"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

const ReactPannellum = dynamic(() => import("react-pannellum"), { ssr: false })

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

interface PanoramaDialogProps {
  panorama: PanoramaNode | undefined
  onClose: () => void
}

function PanoramaDialog({ panorama, onClose }: PanoramaDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={!!panorama} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-screen max-w-full overflow-hidden rounded-none p-0 sm:h-[calc(100vh-6rem)] sm:max-w-[calc(100%-6rem)] sm:rounded-lg">
        <DialogTitle className="sr-only">{t("panorams")}</DialogTitle>
        <DialogDescription className="sr-only">
          {panorama?.name}
        </DialogDescription>
        {panorama && (
          <PanoramaViewer key={panorama.id} image={panorama.image} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PanoramaViewer({ image }: { image: string }) {
  const [loading, setLoading] = useState(true)

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-background">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-foreground" />
        </div>
      )}
      <ReactPannellum
        id="pannellum"
        sceneId="pannellumScene"
        imageSource={`${BASE_PATH}/360/${image}`}
        onPanoramaLoaded={() => setLoading(false)}
        config={{ autoLoad: true, showFullscreenCtrl: true }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}

export { PanoramaDialog }
