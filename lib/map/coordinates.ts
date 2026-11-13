import type { GamePoint } from "@/types/map"

type Coords = [number, number]

/** Масштаб между игровыми ("kr") и пиксельными координатами карты на MAX_ZOOM. */
const SCALE = 0.02
const OFFSET_X = 34299
const OFFSET_Y = 36119
/** У части новых узлов смещение по Y отличается. */
const OFFSET_Y_NEW = 36088

/** Игровые координаты → пиксели карты на MAX_ZOOM. */
export function gameToPixel({ x, y }: GamePoint, isNew = false): Coords {
  const offsetY = isNew ? OFFSET_Y_NEW : OFFSET_Y
  return [OFFSET_X + SCALE * x, offsetY - SCALE * y]
}

/** Пиксели карты на MAX_ZOOM → игровые координаты. */
export function pixelToGame([px, py]: Coords, isNew = false): GamePoint {
  const offsetY = isNew ? OFFSET_Y_NEW : OFFSET_Y
  return { x: (px - OFFSET_X) / SCALE, y: (offsetY - py) / SCALE }
}
