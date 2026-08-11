<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  highlighted: { type: String, default: '증산동' },
  modelValue: { type: Array, default: () => [] },
  max: { type: Number, default: 2 },
  recommendations: {
    type: Array,
    default: () => [
      { id: '증산동', district: '은평구', lat: 37.5838, lng: 126.9095 },
      { id: '응암1동', district: '은평구', lat: 37.5987, lng: 126.923 },
      { id: '망원2동', district: '마포구', lat: 37.5561, lng: 126.9042 },
      { id: '신정3동', district: '양천구', lat: 37.5145, lng: 126.845 },
      { id: '구로제2동', district: '구로구', lat: 37.4945, lng: 126.8815 },
    ],
  },
})
const emit = defineEmits(['update:modelValue', 'select-dong'])

let districtPolygonMap = {}
let originalPolygonColors = {}
let dongBoundsMap = {}
let dongPathsMap = {}
let selectedDongPolygon = null
let kakaoMapInstance = null
let overlays = []

const RAINBOW_25_COLORS = [
  '#FF0000',
  '#FF7F00',
  '#FFD700',
  '#00CC00',
  '#00FFFF',
  '#0000FF',
  '#8B00FF',
  '#FF1493',
  '#ADFF2F',
  '#FF4500',
  '#FFFF00',
  '#008000',
  '#1E90FF',
  '#4B0082',
  '#EE82EE',
  '#DC143C',
  '#FF8C00',
  '#20B2AA',
  '#4169E1',
  '#9400D3',
  '#FF69B4',
  '#00FA9A',
  '#00BFFF',
  '#9932CC',
  '#32CD32',
]

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

onMounted(() => {
  loadKakaoMapScript()
})

function loadKakaoMapScript() {
  if (window.kakao && window.kakao.maps) {
    window.kakao.maps.load(initMap)
    return
  }

  const script = document.createElement('script')
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`
  script.onload = () => {
    window.kakao.maps.load(initMap)
  }
  script.onerror = () => {
    console.error('카카오맵 스크립트 로드 실패')
  }
  document.head.appendChild(script)
}

function initMap() {
  const container = document.getElementById('step-map')
  if (!container) return

  districtPolygonMap = {}
  originalPolygonColors = {}
  dongBoundsMap = {}
  dongPathsMap = {}
  if (selectedDongPolygon) {
    selectedDongPolygon.setMap(null)
    selectedDongPolygon = null
  }

  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(37.5665, 126.978),
    level: 8.6,
  })
  kakaoMapInstance = map

  setTimeout(() => {
    map.relayout()
    const unwantedElements = container.querySelectorAll(
      'a[href*="kakao.com"], img[src*="kakao"], div[style*="position: absolute"][style*="left: 0px"][style*="bottom: 0px"], .r_layer, .dacr',
    )
    unwantedElements.forEach((el) => el.remove())
  }, 100)

  fetch('/seoul_dong.geojson')
    .then((response) => response.json())
    .then((geojson) => {
      if (!geojson || !geojson.features) return

      const districtColorMap = {}
      const allDistricts = []

      geojson.features.forEach((feature) => {
        const fullName = feature.properties.adm_nm || ''
        const nameParts = fullName.split(' ')
        const sigName = nameParts[1]
        if (sigName && !allDistricts.includes(sigName)) {
          allDistricts.push(sigName)
        }
      })

      allDistricts.forEach((sigName, idx) => {
        const colorIdx = (idx * 4) % RAINBOW_25_COLORS.length
        districtColorMap[sigName] = RAINBOW_25_COLORS[colorIdx]
      })

      const districtPathsMap = {}

      geojson.features.forEach((feature) => {
        const fullName = feature.properties.adm_nm || ''
        const nameParts = fullName.split(' ')
        const sigName = nameParts[1]
        const dongName = nameParts[nameParts.length - 1]
        if (!sigName) return

        if (!districtPathsMap[sigName]) {
          districtPathsMap[sigName] = []
        }

        // 동 단위로 정확히 확대(fit)하고 경계선을 그릴 수 있도록
        // 동별 경계(bounds)와 실제 좌표 경로(paths)를 별도로 누적
        if (dongName && !dongBoundsMap[dongName]) {
          dongBoundsMap[dongName] = new window.kakao.maps.LatLngBounds()
        }
        if (dongName && !dongPathsMap[dongName]) {
          dongPathsMap[dongName] = []
        }
        const dongBounds = dongName ? dongBoundsMap[dongName] : null

        const coordinates = feature.geometry.coordinates

        function processCoords(coordsArr) {
          const path = []
          coordsArr.forEach((coord) => {
            const latLng = new window.kakao.maps.LatLng(coord[1], coord[0])
            path.push(latLng)
            if (dongBounds) dongBounds.extend(latLng)
          })
          return path
        }

        if (feature.geometry.type === 'MultiPolygon') {
          coordinates.forEach((polygon) => {
            const path = processCoords(polygon[0])
            districtPathsMap[sigName].push(path)
            if (dongName) dongPathsMap[dongName].push(path)
          })
        } else {
          const path = processCoords(coordinates[0])
          districtPathsMap[sigName].push(path)
          if (dongName) dongPathsMap[dongName].push(path)
        }
      })

      Object.keys(districtPathsMap).forEach((sigName) => {
        const paths = districtPathsMap[sigName]
        const assignedColor = districtColorMap[sigName] || '#FF0000'

        originalPolygonColors[sigName] = assignedColor

        const polygon = new window.kakao.maps.Polygon({
          path: paths,
          strokeWeight: 0.8,
          strokeColor: '#555555',
          strokeOpacity: 0.4,
          fillColor: assignedColor,
          fillOpacity: 0.4,
        })

        districtPolygonMap[sigName] = polygon
        polygon.setMap(map)
      })

      // 최초 로드 시에는 하이라이트만 표시하고, 확대는 하지 않음
      renderRecommendationOverlays(props.highlighted, false)
    })
    .catch((err) => console.error('GeoJSON 로드 오류:', err))
}

function renderRecommendationOverlays(targetId, shouldPan = false) {
  if (!kakaoMapInstance) return

  overlays.forEach((o) => o.setMap(null))
  overlays = []

  let targetItemCoords = null

  props.recommendations.forEach((item) => {
    const latLng = new window.kakao.maps.LatLng(item.lat, item.lng)
    const isHigh = item.id === targetId

    if (isHigh) {
      targetItemCoords = latLng
    }

    const nodeDiv = document.createElement('div')
    nodeDiv.className = `dong-badge ${isHigh ? 'highlighted' : 'normal'}`
    nodeDiv.innerText = item.id
    nodeDiv.onclick = (e) => {
      e.stopPropagation()
      focusOnDong(item.id)
    }

    const customOverlay = new window.kakao.maps.CustomOverlay({
      position: latLng,
      content: nodeDiv,
      xAnchor: 0.5,
      yAnchor: 0.5,
    })
    customOverlay.setMap(kakaoMapInstance)
    overlays.push(customOverlay)
  })

  if (shouldPan && targetItemCoords) {
    kakaoMapInstance.panTo(targetItemCoords)
  }
}

// dongBoundsMap에 정확한 경계가 없을 때(목데이터 등) 사용할 폴백 확대 레벨
const FOCUS_ZOOM_LEVEL = 4

// mockData의 표기(예: '구로제2동')와 실제 geojson 행정동명(예: '구로2동')이
// 다를 수 있어, '제N동' 형태를 'N동'으로 바꿔서도 한 번 더 찾아본다.
function resolveDongKey(id) {
  if (dongBoundsMap[id]) return id
  const normalized = id.replace(/제(\d+동)$/, '$1')
  return dongBoundsMap[normalized] ? normalized : id
}

// 선택된 동의 실제 행정 경계선을 지도 위에 그려서 강조 표시
function highlightDongBoundary(key) {
  if (selectedDongPolygon) {
    selectedDongPolygon.setMap(null)
    selectedDongPolygon = null
  }

  const paths = dongPathsMap[key]
  if (!paths || !kakaoMapInstance) return

  selectedDongPolygon = new window.kakao.maps.Polygon({
    path: paths,
    strokeWeight: 3,
    strokeColor: '#2D7A4F',
    strokeOpacity: 0.9,
    fillColor: '#2D7A4F',
    fillOpacity: 0.25,
  })
  selectedDongPolygon.setMap(kakaoMapInstance)
}

// 뱃지 클릭(또는 외부에서 highlighted prop 변경) 시
// 해당 동의 "경계(바운더리)"에 딱 맞춰 자동으로 확대되도록 처리
function moveToDong(lat, lng, id) {
  if (!kakaoMapInstance) return

  const key = resolveDongKey(id)
  const bounds = dongBoundsMap[key]
  if (bounds && !bounds.isEmpty()) {
    // 실제 행정동 경계(geojson)에 맞춰 딱 그 동만 보이도록 확대
    kakaoMapInstance.setBounds(bounds)
    highlightDongBoundary(key)
  } else {
    // geojson에 없는 동(목데이터 등)은 좌표 기준으로 이동 후 확대
    const moveLatLon = new window.kakao.maps.LatLng(lat, lng)
    kakaoMapInstance.panTo(moveLatLon)
    kakaoMapInstance.setLevel(FOCUS_ZOOM_LEVEL)
    if (selectedDongPolygon) {
      selectedDongPolygon.setMap(null)
      selectedDongPolygon = null
    }
  }

  renderRecommendationOverlays(id, false)
}

// id로 recommendations에서 좌표를 찾아 이동+확대까지 한 번에 처리하는 헬퍼
function focusOnDong(id) {
  const target = props.recommendations.find((item) => item.id === id)
  if (!target) return
  moveToDong(target.lat, target.lng, id)
  emit('select-dong', id)
}

watch(
  () => props.highlighted,
  (newVal) => {
    // 외부(부모)에서 highlighted 값이 바뀌어도(예: 목록에서 동 이름 클릭)
    // 지도가 해당 동으로 자동 확대/이동되도록 처리
    if (kakaoMapInstance) {
      focusOnDong(newVal)
    }
  },
)
</script>

<template>
  <div class="relative w-full h-full">
    <div class="relative w-full h-full min-h-[480px]">
      <div
        id="step-map"
        class="w-full h-full rounded-xl overflow-hidden shadow-sm border border-border"
      ></div>
    </div>
  </div>
</template>

<style scoped>
:deep(.dong-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans KR', sans-serif;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  user-select: none;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

:deep(.dong-badge:hover) {
  transform: scale(1.1);
}

:deep(.dong-badge.highlighted) {
  background-color: #2d7a4f;
  color: white;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid white;
  box-shadow: 0 4px 10px rgba(45, 122, 79, 0.4);
}

:deep(.dong-badge.normal) {
  background-color: #52b37a;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border: 2px solid white;
}
</style>
