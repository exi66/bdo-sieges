"use client"

import dynamic from "next/dynamic"

const Map = dynamic(() => import("./map").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-background" />,
})

function MapWrapper() {
  return <Map />
}

export { MapWrapper }
