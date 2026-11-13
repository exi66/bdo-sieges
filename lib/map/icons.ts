import L from "leaflet"
import type { MapNode, MarkerType, PanoramaNode, UserMarker } from "@/types/map"
import { DEFAULT_ICON, escapeHtml, isMarkerIcon } from "@/lib/map/markers"
import castleMarker from "@/public/icons/castle-marker.svg"
import nodeMarker from "@/public/icons/node-marker.svg"
import cameraMarker from "@/public/icons/camera-marker.svg"

// Классы пишутся целиком, чтобы Tailwind нашёл их при сканировании исходников.
const LABEL_CLASS =
  "absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white text-shadow-md/80 text-xs whitespace-nowrap"

/* ---------- Иконки узлов и панорам ---------- */

const NODE_ICON_WIDTH = 28
const NODE_ICON_HEIGHT = 32

function createImageIcon(src: string, label: string) {
  const text = escapeHtml(label)

  return L.divIcon({
    className: "custom-marker",
    html: `<div class="relative w-full h-full">
      <img src="${src}" alt="${text}" class="w-full h-full" />
      <div class="${LABEL_CLASS}">${text}</div>
    </div>`,
    iconSize: [NODE_ICON_WIDTH, NODE_ICON_HEIGHT],
    iconAnchor: [NODE_ICON_WIDTH / 2, NODE_ICON_HEIGHT],
  })
}

export const createNodeIcon = (node: MapNode) =>
  createImageIcon(nodeMarker.src, node.name)

export const createCastleIcon = (node: MapNode) =>
  createImageIcon(castleMarker.src, node.name)

export const createCameraIcon = (node: PanoramaNode) =>
  createImageIcon(cameraMarker.src, node.name)

/* ---------- Пользовательские маркеры ---------- */

interface MarkerShape {
  width: number
  height: number
  scale: number
  /** Содержимое <svg>; заливка берётся из CSS-переменной --color. */
  shape: string
  iconClass: string
  labelClass: string
  /** Точка привязки в исходных (немасштабированных) пикселях. */
  anchor: [number, number]
}

const SHAPE_ATTRS = `fill="var(--color, #FF0000)" stroke-linecap="round" stroke-linejoin="round"`

const MARKER_SHAPES: Record<MarkerType, MarkerShape> = {
  // Форт
  0: {
    width: 36,
    height: 60,
    scale: 0.8,
    shape: `<polygon ${SHAPE_ATTRS} points="35.2 19.9 35.2 24 33.3 25.9 33.3 49.5 26.9 55.9 24.2 53.1 18 59.3 11.8 53.1 9.1 55.9 2.7 49.5 2.7 25.9 0.8 24 0.8 19.9 2.7 18 9.8 18 9.8 8.3 8.6 7.1 8.6 2.7 10.4 1 12.6 1 15.2 3.5 18 0.7 20.8 3.5 23.4 1 25.7 1 27.4 2.7 27.4 7.1 26.2 8.3 26.2 18 33.3 18"/>`,
    iconClass: "top-5 left-1/2 -translate-x-1/2",
    labelClass: LABEL_CLASS,
    anchor: [18, 60],
  },
  // Флаг
  1: {
    width: 32,
    height: 32,
    scale: 1,
    shape: `<path ${SHAPE_ATTRS} d="M6,30H4V2H28l-5.8,9L28,20H6Z"/>`,
    iconClass: "top-1 left-1.75",
    labelClass:
      "absolute -bottom-2.5 left-1 transform -translate-x-1/2 translate-y-1/2 text-white text-shadow-md/80 text-xs whitespace-nowrap",
    anchor: [4, 32],
  },
  // Маркер
  2: {
    width: 34,
    height: 44,
    scale: 0.8,
    shape: `<path ${SHAPE_ATTRS} d="m1 16.749c0-8.6973 7.1642-15.749 16-15.749 8.8358 0 16 7.0518 16 15.749 0 6.3497-2.2475 8.1231-14.358 25.404-0.79425 1.1295-2.4925 1.1295-3.2867 0-12.107-17.283-14.355-19.055-14.355-25.404z"/>`,
    iconClass: "top-2 left-1/2 -translate-x-1/2",
    labelClass: LABEL_CLASS,
    anchor: [17, 44],
  },
}

function buildMarkerIcon(marker: UserMarker, isActive: boolean) {
  const { width, height, scale, shape, iconClass, labelClass, anchor } =
    MARKER_SHAPES[marker.type] ?? MARKER_SHAPES[2]

  // Данные проверяются при загрузке, но HTML собирается строкой,
  // поэтому здесь повторно не доверяем ничему, что пришло извне.
  const colorClass = Number.isInteger(marker.color)
    ? `color-${marker.color}`
    : ""
  const icon = isMarkerIcon(marker.icon) ? marker.icon : DEFAULT_ICON

  return L.divIcon({
    className: "custom-marker",
    html: `<div class="relative w-full h-full">
      <div class="relative w-full h-full ${colorClass} group" data-active="${isActive}">
        <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="group-data-active:stroke-foreground group-data-active:stroke-4 stroke-background/80 stroke-1">${shape}</svg>
        <i class="absolute h-3.5 aspect-square bg-center bg-no-repeat ${iconClass} ${icon}"></i>
      </div>
      <div class="${labelClass}">${escapeHtml(marker.tooltip)}</div>
    </div>`,
    iconSize: [width * scale, height * scale],
    iconAnchor: [anchor[0] * scale, anchor[1] * scale],
  })
}

/** Кэш иконок: одинаковая ссылка не заставляет Leaflet пересоздавать DOM маркера. */
const markerIconCache = new Map<string, L.DivIcon>()
const MARKER_ICON_CACHE_LIMIT = 500

export function getMarkerIcon(marker: UserMarker, isActive: boolean) {
  const key = JSON.stringify([
    marker.type,
    marker.color,
    marker.icon,
    marker.tooltip,
    isActive,
  ])

  let icon = markerIconCache.get(key)
  if (!icon) {
    if (markerIconCache.size >= MARKER_ICON_CACHE_LIMIT) markerIconCache.clear()
    icon = buildMarkerIcon(marker, isActive)
    markerIconCache.set(key, icon)
  }
  return icon
}
