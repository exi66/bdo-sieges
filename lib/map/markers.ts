import type { MarkerType, UserMarker } from "@/types/map"
import { COLOR_COUNT } from "@/lib/map/constants"

export const MARKER_TYPES: { type: MarkerType; langKey: string }[] = [
  { type: 0, langKey: "tool_fortress" },
  { type: 1, langKey: "tool_flag" },
  { type: 2, langKey: "tool_marker" },
]

export const MARKER_ICONS = [
  "icon-empty",
  "icon-crown",
  "icon-shield",
  "icon-sword",
  "icon-cannon",
  "icon-first",
  "icon-second",
  "icon-third",
  "icon-fourth",
  "icon-fifth",
] as const

export const MARKER_COLORS = Array.from(
  { length: COLOR_COUNT },
  (_, i) => i + 1
)

export const DEFAULT_ICON = MARKER_ICONS[0]
export const DEFAULT_COLOR = 1

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

export const isMarkerType = (value: unknown): value is MarkerType =>
  MARKER_TYPES.some((t) => t.type === value)

export const isMarkerIcon = (value: unknown): value is string =>
  (MARKER_ICONS as readonly unknown[]).includes(value)

export const isMarkerColor = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= COLOR_COUNT

/**
 * Проверяет и нормализует маркер из недоверенного источника
 * (localStorage, код импорта). Возвращает null, если данные некорректны.
 */
export function parseMarker(value: unknown): UserMarker | null {
  if (!isRecord(value) || !isRecord(value.position)) return null

  const { id, type, position, color, icon, tooltip, draggable } = value
  if (!isFiniteNumber(id) || !isMarkerType(type)) return null
  if (!isFiniteNumber(position.lat) || !isFiniteNumber(position.lng))
    return null
  if (color != null && !isMarkerColor(color)) return null
  if (icon != null && !isMarkerIcon(icon)) return null
  if (tooltip != null && typeof tooltip !== "string") return null

  return {
    id,
    type,
    position: { lat: position.lat, lng: position.lng },
    color: color ?? null,
    icon: icon ?? null,
    tooltip: tooltip ?? "",
    draggable: draggable === true,
  }
}

/** Разбирает массив маркеров целиком; при любой ошибке возвращает null. */
export function parseMarkers(value: unknown): UserMarker[] | null {
  if (!Array.isArray(value)) return null
  const markers: UserMarker[] = []
  for (const item of value) {
    const marker = parseMarker(item)
    if (!marker) return null
    markers.push(marker)
  }
  return markers
}

/** Уникальный id, даже если маркеры добавляются быстрее, чем раз в мс. */
export function createMarkerId(existing: UserMarker[]): number {
  const maxId = existing.reduce((max, m) => Math.max(max, m.id), 0)
  return Math.max(Date.now(), maxId + 1)
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
