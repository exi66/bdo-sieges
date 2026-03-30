"use client"

import { useEffect, useState } from "react"
import { useMap, Polyline, Tooltip, Marker } from "react-leaflet"
import "@geoman-io/leaflet-geoman-free"
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css"
import { mapConverter } from "@/map/utils"
import { getCssVar } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import L from "leaflet"

function GeomanControl() {
  const map = useMap()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (!map) return

    map.pm.addControls({
      position: "topleft",
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: true,
      drawRectangle: true,
      drawPolygon: true,
      drawCircle: true,
      editMode: true,
      dragMode: true,
      removalMode: true,
    })

    const langCode = i18n.language.split("-")[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.pm.setLang(langCode as any)

    map.on("pm:create", (e) => {
      const layer = e.layer
      const maxZoom = map.getMaxZoom()
      if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
        const latlngs = layer.getLatLngs()
        const flatLatLngs = Array.isArray(latlngs[0])
          ? (latlngs[0] as L.LatLng[])
          : (latlngs as L.LatLng[])

        const krCoords = flatLatLngs.map((ll) => {
          const point = map.project(ll, maxZoom)
          const [x, y] = mapConverter.convert([point.x, point.y], "sl2", "kr")

          return {
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2)),
          }
        })

        console.log(krCoords)
      }
    })

    return () => {
      map.pm.removeControls()
      map.off("pm:create")
    }
  }, [map, i18n.language])

  return null
}

interface RulerProps {
  active: boolean
  points: L.LatLng[]
  setPoints: (points: L.LatLng[]) => void
}

function RulerControl({ active, points, setPoints }: RulerProps) {
  const map = useMap()
  const [cursorPos, setCursorPos] = useState<L.LatLng | null>(null)

  useEffect(() => {
    if (!active) return

    const onClick = (e: L.LeafletMouseEvent) => {
      setPoints([...points, e.latlng])
    }

    const onMouseMove = (e: L.LeafletMouseEvent) => {
      setCursorPos(e.latlng)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPoints([])
    }

    map.on("click", onClick)
    map.on("mousemove", onMouseMove)
    window.addEventListener("keydown", onKeyDown)

    return () => {
      map.off("click", onClick)
      map.off("mousemove", onMouseMove)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [map, active, points, setPoints])

  if (!active || points.length === 0) return null

  const formatDistance = (p1: L.LatLng, p2: L.LatLng) => {
    const dist = p1.distanceTo(p2)
    const gameModify = 0.93
    return `${Math.round((dist / 1000) * gameModify)} м`
  }

  return (
    <>
      <Polyline
        positions={points}
        color={getCssVar("--chart-1")}
        dashArray={[10, 10]}
        weight={2}
      />
      {cursorPos && points.length > 0 && (
        <Polyline
          positions={[points[points.length - 1], cursorPos]}
          color={getCssVar("--chart-1")}
          dashArray={[10, 10]}
          weight={2}
        />
      )}
      {points.map((p, i) => (
        <Marker key={i} position={p} icon={L.divIcon({ className: "hidden" })}>
          <Tooltip
            permanent
            direction="top"
            className="pointer-events-none p-1 text-[10px]"
          >
            {i === 0 ? "Старт" : formatDistance(points[0], p)}
          </Tooltip>
        </Marker>
      ))}
    </>
  )
}

export { GeomanControl, RulerControl }
