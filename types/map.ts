/** Точка в игровых координатах (формат "kr"). */
export interface GamePoint {
  x: number
  y: number
}

export interface GameLocation extends GamePoint {
  fmt: string
}

/** Узел или территория осады на карте. */
export interface MapNode {
  id: number
  name: string
  location: GameLocation
  polygon: GamePoint[]
  /** Узел использует обновлённое смещение координат. */
  new?: boolean
}

export interface PanoramaNode {
  id: number
  name: string
  location: GameLocation
  image: string
}

export type MarkerType = 0 | 1 | 2

/** Пользовательский маркер, сохраняемый в localStorage и в коде экспорта. */
export interface UserMarker {
  id: number
  type: MarkerType
  position: { lat: number; lng: number }
  color: number | null
  icon: string | null
  tooltip: string
  draggable?: boolean
}
