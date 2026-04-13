"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const ReactPannellum = dynamic(() => import("react-pannellum"), {
  ssr: false,
})

const basePath = process.env.__NEXT_ROUTER_BASEPATH || ""

function Pannellum({ image }: { image: string }) {
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
        imageSource={`${basePath}/360/${image}`}
        onPanoramaLoaded={() => setLoading(false)}
        config={{
          autoLoad: true,
          showFullscreenCtrl: true,
        }}
        style={{ width: "100%", height: "100%" }}
      />

      <style jsx global>{`
        .pnlm-load-box {
          display: none !important;
        }
        .pnlm-controls-container {
          left: 8px;
          top: 4px;
        }
        .pnlm-about-msg {
          display: none !important;
          visibility: hidden !important;
        }
        .pnlm-context-menu {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  )
}

export { Pannellum }
