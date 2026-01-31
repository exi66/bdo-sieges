export class MapCoordinateConverter {
  conversions
  constructor() {
    ;((this.conversions = {}),
      (this.conversions['kr-sl2'] = this.createConversionForKrToSl2()),
      (this.conversions['sl2-kr'] = this.createConversionForSl2ToKr()))
  }
  convert(t, e = 'kr', i = 'sl2') {
    let n = this.conversions[`${e}-${i}`]
    if (!n) throw Error(`No conversion found for ${e}-${i}`)
    let [o, s] = t
    return (
      n.pretranslate && ((o = n.pretranslate.x + o), (s = n.pretranslate.y + s)),
      [n.translate.x + n.scale.x * o, n.translate.y + n.scale.y * s]
    )
  }
  batch(t, e = 'kr', i = 'sl2') {
    let n = this.conversions[`${e}-${i}`]
    if (!n) throw Error(`No conversion found for ${e}-${i}`)
    let o = n.translate,
      s = n.scale,
      r = n.pretranslate
    return t.map((t) => {
      let [e, i] = t
      return (r && ((e = r.x + e), (i = r.y + i)), [o.x + s.x * e, o.y + s.y * i])
    })
  }
  convertNode(t) {
    if (t.location && 'kr' === t.location.fmt)
      return this.convert([t.location.x, t.location.y], 'kr', 'sl2')
    throw Error('Node does not have KR format location data')
  }
  convertNodes(t) {
    return t.map((t) => ({
      id: t.id,
      coords: this.convertNode(t),
      node: t
    }))
  }
  createConversionForKrToSl2() {
    return {
      pretranslate: {
        x: 0,
        y: 0
      },
      translate: {
        x: 17149,
        y: 18059
      },
      scale: {
        x: 0.01,
        y: -0.01
      }
    }
  }
  createConversionForSl2ToKr() {
    return {
      pretranslate: {
        x: -17149,
        y: -18059
      },
      translate: {
        x: 0,
        y: 0
      },
      scale: {
        x: 100,
        y: -100
      }
    }
  }
}

export const mapConverter = new MapCoordinateConverter()
