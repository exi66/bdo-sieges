import type { LatLngBoundsLiteral, LatLngTuple } from "leaflet"

/** Максимальный зум; в его пикселях заданы все проекции координат. */
export const MAX_ZOOM = 8
export const MIN_ZOOM = 4
export const DEFAULT_ZOOM = 4
export const DEFAULT_CENTER: LatLngTuple = [-140, 140]
export const MAX_BOUNDS: LatLngBoundsLiteral = [
  [-240, 0],
  [0, 250],
]

/** Границы мира в единицах CRS.Simple — для тайлов и маски регионов. */
const WORLD_HALF_HEIGHT = 30718
const WORLD_HALF_WIDTH = 28768

export const TILE_BOUNDS: LatLngBoundsLiteral = [
  [WORLD_HALF_HEIGHT, -WORLD_HALF_WIDTH],
  [-WORLD_HALF_HEIGHT, WORLD_HALF_WIDTH],
]

export const WORLD_RING: LatLngTuple[] = [
  [-WORLD_HALF_HEIGHT, -WORLD_HALF_WIDTH],
  [WORLD_HALF_HEIGHT, -WORLD_HALF_WIDTH],
  [WORLD_HALF_HEIGHT, WORLD_HALF_WIDTH],
  [-WORLD_HALF_HEIGHT, WORLD_HALF_WIDTH],
]

export const TILE_URL = "https://storage.nodewar.gg/map/tiles/{z}/{x}_{y}.webp"
export const TILE_PROVIDER_URL = "https://nodewar.gg/"

/** Поправка, переводящая расстояние на карте в игровые метры. */
export const GAME_DISTANCE_FACTOR = 0.93 / 1000

export const COLOR_COUNT = 40
