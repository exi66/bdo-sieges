interface ConversionConfig {
  pretranslate?: { x: number; y: number }
  translate: { x: number; y: number }
  scale: { x: number; y: number }
}

type Coords = [number, number]

interface Point {
  x: string | number
  y: string | number
}

interface SiegeNode {
  id: number
  name: string
  location: {
    fmt: string
    x: number
    y: number
  }
  polygon: Point[]
}

interface PanoramNode {
  id: number
  name: string
  location: {
    fmt: string
    x: number
    y: number
  }
  image: string
}

type PanoramsData = PanoramNode[]

type NodesData = SiegeNode[]

interface UserMarker {
  id: number
  type: number
  position: { lat: number; lng: number }
  color: number | null
  icon: string | null
  tooltip: string
  draggable?: boolean
}

interface UserPointer {
  id: number
  start: L.LatLng
  end: L.LatLng
  color: string
}

declare module "*.css" {
  const content: { [className: string]: string }
  export default content
}
