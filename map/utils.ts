export const markerTypes = [
  { lang_key: "tool_fortress", type: 0 },
  { lang_key: "tool_flag", type: 1 },
  { lang_key: "tool_marker", type: 2 },
]

export class MapCoordinateConverter {
  private conversions: Record<string, ConversionConfig> = {}

  constructor() {
    this.conversions["kr-sl2"] = this.createConversionForKrToSl2()
    this.conversions["sl2-kr"] = this.createConversionForSl2ToKr()
  }

  convert(coords: Coords, from = "kr", to = "sl2"): Coords {
    const config = this.conversions[`${from}-${to}`]
    if (!config) throw new Error(`No conversion found for ${from}-${to}`)

    let [x, y] = coords

    if (config.pretranslate) {
      x += config.pretranslate.x
      y += config.pretranslate.y
    }

    return [
      config.translate.x + config.scale.x * x,
      config.translate.y + config.scale.y * y,
    ]
  }

  batch(points: Coords[], from = "kr", to = "sl2"): Coords[] {
    const config = this.conversions[`${from}-${to}`]
    if (!config) throw new Error(`No conversion found for ${from}-${to}`)

    const { translate: o, scale: s, pretranslate: r } = config

    return points.map(([x, y]) => {
      let curX = x
      let curY = y
      if (r) {
        curX += r.x
        curY += r.y
      }
      return [o.x + s.x * curX, o.y + s.y * curY]
    })
  }

  convertNode(node: SiegeNode): Coords {
    if (node.location && node.location?.fmt === "kr") {
      return this.convert([node.location.x, node.location.y], "kr", "sl2")
    }
    throw new Error("Node does not have KR format location data")
  }

  convertNodes(nodes: NodesData) {
    return nodes.map((node) => ({
      id: node.id,
      coords: this.convertNode(node),
      node: node,
    }))
  }

  private createConversionForKrToSl2(): ConversionConfig {
    return {
      pretranslate: { x: 0, y: 0 },
      translate: { x: 34299, y: 36119 },
      scale: { x: 0.02, y: -0.02 },
    }
  }

  private createConversionForSl2ToKr(): ConversionConfig {
    return {
      pretranslate: { x: -34299, y: -36119 },
      translate: { x: 0, y: 0 },
      scale: { x: 50, y: -50 },
    }
  }
}

export const mapConverter = new MapCoordinateConverter()
