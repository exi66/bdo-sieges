"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import { useTranslation } from "react-i18next"
import L from "leaflet"
import "@geoman-io/leaflet-geoman-free"
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css"
import { pixelToGame } from "@/lib/map/coordinates"
import { MAX_ZOOM } from "@/lib/map/constants"

type GeomanLang = Parameters<L.PM.PMMap["setLang"]>[0]

/** Панель рисования фигур (Leaflet-Geoman). */
function GeomanControl() {
  const map = useMap()
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? "ru"

  useEffect(() => {
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
    map.pm.setLang(language as GeomanLang)

    // В режиме разработки печатает игровые координаты нарисованной фигуры —
    // удобно для добавления новых регионов в data/*.json.
    const logGameCoords = (e: { layer: L.Layer }) => {
      if (!(e.layer instanceof L.Polyline)) return
      const latlngs = e.layer.getLatLngs()
      const ring = (
        Array.isArray(latlngs[0]) ? latlngs[0] : latlngs
      ) as L.LatLng[]

      console.log(
        ring.map((ll) => {
          const { x, y } = map.project(ll, MAX_ZOOM)
          const game = pixelToGame([x, y])
          return { x: Number(game.x.toFixed(2)), y: Number(game.y.toFixed(2)) }
        })
      )
    }

    if (process.env.NODE_ENV === "development") {
      map.on("pm:create", logGameCoords)
    }

    return () => {
      map.pm.removeControls()
      map.off("pm:create", logGameCoords)
    }
  }, [map, language])

  return null
}

export { GeomanControl }
