function pointKey([lng, lat]) {
  return `${lng},${lat}`
}

function segmentKey(startKey, endKey) {
  return startKey < endKey ? `${startKey}|${endKey}` : `${endKey}|${startKey}`
}

// 동 경계 GeoJSON에서 서로 맞닿은 선분을 제외해 구 외곽선만 이어진 경로로 만든다.
export function buildDistrictOutlinePaths(geojson, kakaoMaps) {
  const segmentsByDistrict = new Map()

  geojson.features.forEach((feature) => {
    const districtName = (feature.properties.adm_nm || '').split(' ')[1]
    if (!districtName) return

    if (!segmentsByDistrict.has(districtName)) {
      segmentsByDistrict.set(districtName, new Map())
    }
    const segmentMap = segmentsByDistrict.get(districtName)
    const polygons = feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates
      : [feature.geometry.coordinates]

    polygons.forEach((polygon) => {
      const outerRing = polygon[0]
      for (let index = 0; index < outerRing.length - 1; index += 1) {
        const start = outerRing[index]
        const end = outerRing[index + 1]
        const startKey = pointKey(start)
        const endKey = pointKey(end)
        const key = segmentKey(startKey, endKey)
        const segment = segmentMap.get(key) || { key, start, end, startKey, endKey, count: 0 }
        segment.count += 1
        segmentMap.set(key, segment)
      }
    })
  })

  const result = {}
  segmentsByDistrict.forEach((segmentMap, districtName) => {
    const exteriorSegments = [...segmentMap.values()].filter((segment) => segment.count === 1)
    const adjacentSegments = new Map()

    exteriorSegments.forEach((segment) => {
      ;[segment.startKey, segment.endKey].forEach((key) => {
        if (!adjacentSegments.has(key)) adjacentSegments.set(key, [])
        adjacentSegments.get(key).push(segment)
      })
    })

    const visited = new Set()
    result[districtName] = []

    exteriorSegments.forEach((firstSegment) => {
      if (visited.has(firstSegment.key)) return

      const path = [firstSegment.start, firstSegment.end]
      const firstPointKey = firstSegment.startKey
      let currentPointKey = firstSegment.endKey
      visited.add(firstSegment.key)

      while (currentPointKey !== firstPointKey) {
        const nextSegment = (adjacentSegments.get(currentPointKey) || []).find(
          (segment) => !visited.has(segment.key),
        )
        if (!nextSegment) break

        visited.add(nextSegment.key)
        const usesStart = nextSegment.startKey === currentPointKey
        path.push(usesStart ? nextSegment.end : nextSegment.start)
        currentPointKey = usesStart ? nextSegment.endKey : nextSegment.startKey
      }

      if (path.length > 1) {
        result[districtName].push(path.map(([lng, lat]) => new kakaoMaps.LatLng(lat, lng)))
      }
    })
  })

  return result
}
