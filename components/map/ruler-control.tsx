"use client"

import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { Marker, Polyline, Tooltip, useMap } from "react-leaflet"
import { useTranslation } from "react-i18next"
import L from "leaflet"
import { GAME_DISTANCE_FACTOR } from "@/lib/map/constants"

interface RulerControlProps {
  active: boolean
  points: L.LatLng[]
  setPoints: Dispatch<SetStateAction<L.LatLng[]>>
}

const HIDDEN_ICON = L.divIcon({ className: "hidden" })
const LINE_OPTIONS: L.PolylineOptions = {
  className: "map-ruler-line",
  dashArray: [10, 10],
  weight: 2,
}

/** Линейка: клики по карте добавляют точки, Esc сбрасывает. */
function RulerControl({ active, points, setPoints }: RulerControlProps) {
  const map = useMap()
  const { t } = useTranslation()
  const [cursor, setCursor] = useState<L.LatLng | null>(null)

  useEffect(() => {
    if (!active) return

    const onClick = (e: L.LeafletMouseEvent) =>
      setPoints((prev) => [...prev, e.latlng])
    const onMouseMove = (e: L.LeafletMouseEvent) => setCursor(e.latlng)
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
  }, [map, active, setPoints])

  if (!active || points.length === 0) return null

  const start = points[0]
  const formatDistance = (point: L.LatLng) =>
    t("distance_meters", {
      value: Math.round(start.distanceTo(point) * GAME_DISTANCE_FACTOR),
    })

  return (
    <>
      <Polyline positions={points} pathOptions={LINE_OPTIONS} />
      {cursor && (
        <Polyline
          positions={[points[points.length - 1], cursor]}
          pathOptions={LINE_OPTIONS}
        />
      )}
      {points.map((point, i) => (
        <Marker key={i} position={point} icon={HIDDEN_ICON}>
          <Tooltip
            permanent
            direction="top"
            className="pointer-events-none p-1 text-[10px]"
          >
            {i === 0 ? t("ruler_start") : formatDistance(point)}
          </Tooltip>
        </Marker>
      ))}
    </>
  )
}

export { RulerControl }
