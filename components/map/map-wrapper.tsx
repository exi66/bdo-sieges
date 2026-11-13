"use client"

import dynamic from "next/dynamic"

// Leaflet работает только в браузере, поэтому карта грузится без SSR.
const SiegeMap = dynamic(
  () => import("./siege-map").then((mod) => mod.SiegeMap),
  {
    ssr: false,
    loading: () => <div className="h-screen w-screen bg-background" />,
  }
)

function MapWrapper() {
  return <SiegeMap />
}

export { MapWrapper }
