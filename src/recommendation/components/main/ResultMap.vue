<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { loadSeoulGeojson } from '@/common/utils/loadSeoulGeojson.js'
import { loadKakaoMap } from '@/common/utils/loadKakaoMap.js'
import { buildDistrictOutlinePaths } from '@/common/utils/buildDistrictOutlinePaths.js'

const props = defineProps({
  focusedAdminDongId: { type: Number, default: null },
  modelValue: { type: Array, default: () => [] },
  max: { type: Number, default: 2 },
  recommendations: {
    type: Array,
    default: () => [
      { id: 1, district: '은평구', dongName: '증산동', lat: 37.5838, lng: 126.9095 },
      { id: 2, district: '은평구', dongName: '응암1동', lat: 37.5987, lng: 126.923 },
      { id: 3, district: '마포구', dongName: '망원2동', lat: 37.5561, lng: 126.9042 },
      { id: 4, district: '양천구', dongName: '신정3동', lat: 37.5145, lng: 126.845 },
      { id: 5, district: '구로구', dongName: '구로2동', lat: 37.4945, lng: 126.8815 },
    ],
  },
})
const emit = defineEmits(['update:modelValue', 'toggle-focus', 'force-focus'])

// document.getElementById('step-map') 하드코딩 대신 template ref 사용
// (같은 컴포넌트 인스턴스가 2개 이상 존재해도 서로 다른 DOM을 정확히 참조)
const mapContainer = ref(null)

// 지도/geojson이 준비되기 전엔 빈 화면 대신 로딩 표시를 보여준다
const isLoading = ref(true)
const loadError = ref(false)

let districtPolygonMap = {}
let originalPolygonColors = {}
let districtBoundsMap = {}
let dongBoundsMap = {}
let dongPathsMap = {}
let selectedDongPolygon = null
let kakaoMapInstance = null
let overlays = []
let districtOutlineList = []

function createDongKey(district, dongName) {
  const normalizedDong = String(dongName ?? '')
    .replace(/[\s,.·ㆍ]/g, '')
    .replace(/제(\d+동)$/, '$1')
  return `${district}:${normalizedDong}`
}

const RAINBOW_25_COLORS = [
  '#C9675B', '#D38A4C', '#C8A44A', '#6F9876', '#5E9FA5',
  '#5E83B3', '#8A6AA8', '#C26F8C', '#8A7B5B', '#C76E4D',
  '#967852', '#5B8B68', '#B7825A', '#76639A', '#AD789B',
  '#B85D63', '#BE8744', '#52968E', '#667EAF', '#895B9F',
  '#C97D9E', '#5D7F76', '#5C9ABB', '#B86C78', '#748168',
]

// 카카오맵 지도 레벨은 정수(1~14)만 지원한다.
// 소수점 레벨(예: 8.45)을 넘기면 타일 요청 URL에 그 값이 그대로 들어가
// (예: .../latest/8.45/42/20.png) 존재하지 않는 디렉토리를 요청하게 되어
// 타일 서버가 전부 400을 반환하고, 기본 축척 표시도 NaN으로 깨진다.
const INITIAL_ZOOM_LEVEL = 9
const LABEL_VISIBLE_MAX_LEVEL = 9

// 컴포넌트가 이미 언마운트된 뒤에 도착하는 비동기 콜백(SDK 로드, geojson fetch,
// setTimeout)이 사라진 컨테이너에 지도를 다시 붙이는 것을 막기 위한 플래그.
let disposed = false

onMounted(() => {
  // 지도 컴포넌트마다 각자 <script> 태그를 추가하면, 여러 지도가 거의 동시에
  // 마운트될 때 카카오 SDK 스크립트가 중복으로 추가되어 로드가 간헐적으로
  // 실패하는 문제가 있었다. loadKakaoMap()은 모듈 레벨에서 Promise를 캐싱해
  // 스크립트를 앱 전체에서 딱 한 번만 추가하고, 이후 호출은 그 결과를 공유한다.
  loadKakaoMap()
    .then(() => {
      if (disposed) return
      initMap()
    })
    .catch((err) => {
      console.error('카카오맵 스크립트 로드 실패', err)
      if (disposed) return
      isLoading.value = false
      loadError.value = true
    })
})

function initMap() {
  const container = mapContainer.value
  if (!container) return

  districtPolygonMap = {}
  originalPolygonColors = {}
  districtBoundsMap = {}
  dongBoundsMap = {}
  dongPathsMap = {}
  districtOutlineList.forEach((outline) => outline.setMap(null))
  districtOutlineList = []
  clearSelectedDongPolygon()

  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(37.5665, 126.978),
    level: INITIAL_ZOOM_LEVEL,
    // 추천 결과 지도는 휠 확대·축소는 유지하고 더블클릭 확대만 막는다.
    disableDoubleClickZoom: true,
  })
  kakaoMapInstance = map
  // 한반도 수준보다 멀리 축소되지 않도록 제한한다.
  map.setMaxLevel(12)
  window.kakao.maps.event.addListener(map, 'zoom_changed', updateOverlayVisibility)

  // 카카오맵 이용약관상 로고/저작권 표기는 항상 노출되어야 하므로,
  // DOM에서 임의로 지우지 않고 공식 API로 위치만 조정한다.
  // (DOM 삭제 시 약관 위반으로 앱 키가 정지될 수 있음)
  map.setCopyrightPosition(window.kakao.maps.CopyrightPosition.BOTTOMRIGHT, true)

  setTimeout(() => {
    if (disposed) return
    map.relayout()
  }, 100)

  loadSeoulGeojson()
    .then((geojson) => {
      if (disposed) return
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
        if (!districtBoundsMap[sigName]) {
          districtBoundsMap[sigName] = new window.kakao.maps.LatLngBounds()
        }

        // 동 단위로 정확히 확대(fit)하고 경계선을 그릴 수 있도록
        // 동별 경계(bounds)와 실제 좌표 경로(paths)를 별도로 누적
        const dongKey = dongName ? createDongKey(sigName, dongName) : null
        if (dongKey && !dongBoundsMap[dongKey]) {
          dongBoundsMap[dongKey] = new window.kakao.maps.LatLngBounds()
        }
        if (dongKey && !dongPathsMap[dongKey]) {
          dongPathsMap[dongKey] = []
        }
        const dongBounds = dongKey ? dongBoundsMap[dongKey] : null

        const coordinates = feature.geometry.coordinates

        function processCoords(coordsArr) {
          const path = []
          coordsArr.forEach((coord) => {
            const latLng = new window.kakao.maps.LatLng(coord[1], coord[0])
            path.push(latLng)
            if (dongBounds) dongBounds.extend(latLng)
            districtBoundsMap[sigName].extend(latLng)
          })
          return path
        }

        if (feature.geometry.type === 'MultiPolygon') {
          coordinates.forEach((polygon) => {
            const path = processCoords(polygon[0])
            districtPathsMap[sigName].push(path)
            if (dongKey) dongPathsMap[dongKey].push(path)
          })
        } else {
          const path = processCoords(coordinates[0])
          districtPathsMap[sigName].push(path)
          if (dongKey) dongPathsMap[dongKey].push(path)
        }
      })

      Object.keys(districtPathsMap).forEach((sigName) => {
        const paths = districtPathsMap[sigName]
        const assignedColor = districtColorMap[sigName] || '#FF0000'
        const isRecommendedDistrict = props.recommendations.some((item) => item.district === sigName)

        originalPolygonColors[sigName] = assignedColor

        const polygon = new window.kakao.maps.Polygon({
          path: paths,
          strokeWeight: 1,
          strokeColor: '#FFFDF8',
          strokeOpacity: 0.95,
          fillColor: assignedColor,
          fillOpacity: isRecommendedDistrict ? 0.65 : 0,
        })

        districtPolygonMap[sigName] = polygon
        polygon.setMap(map)
      })

      const districtOutlinePaths = buildDistrictOutlinePaths(geojson, window.kakao.maps)
      Object.values(districtOutlinePaths).forEach((paths) => {
        paths.forEach((path) => {
          const outline = new window.kakao.maps.Polyline({
            path,
            strokeWeight: 2.5,
            strokeColor: '#1F2937',
            strokeOpacity: 0.9,
          })
          outline.setZIndex(10)
          outline.setMap(map)
          districtOutlineList.push(outline)
        })
      })

      renderMapLabels()
      if (props.focusedAdminDongId != null) focusOnDong(props.focusedAdminDongId)
      isLoading.value = false
    })
    .catch((err) => {
      console.error('GeoJSON 로드 오류:', err)
      if (disposed) return
      isLoading.value = false
      loadError.value = true
    })
}

function clearOverlays() {
  overlays.forEach((overlay) => overlay.setMap(null))
  overlays = []
}

function clearSelectedDongPolygon() {
  if (!selectedDongPolygon) return
  selectedDongPolygon.setMap(null)
  selectedDongPolygon = null
}

function renderMapLabels() {
  if (!kakaoMapInstance) return
  clearOverlays()

  // 기존 방식으로 되돌린다: 추천 결과 동 이름표를 모두 만들고 지도 레벨 1~8에서 표시한다.
  props.recommendations.forEach((item) => {
    const latLng = new window.kakao.maps.LatLng(item.lat, item.lng)
    const nodeDiv = document.createElement('div')
    const isSelected = props.modelValue.includes(item.id)
    const isFocused = item.id === props.focusedAdminDongId
    nodeDiv.className = `dong-badge ${isFocused ? 'highlighted' : 'normal'} ${isSelected ? 'selected' : ''}`
    nodeDiv.innerText = item.dongName
    nodeDiv.onclick = (e) => {
      e.stopPropagation()
      // 현재 확대 레벨과 무관하게 해당 동이 속한 구를 6레벨로 다시 포커싱한다.
      emit('force-focus', item.id)
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

  updateOverlayVisibility()
}

function updateOverlayVisibility() {
  if (!kakaoMapInstance) return
  const isVisible = kakaoMapInstance.getLevel() <= LABEL_VISIBLE_MAX_LEVEL
  overlays.forEach((overlay) => overlay.setVisible(isVisible))
}

// dongBoundsMap에 정확한 경계가 없을 때(목데이터 등) 사용할 폴백 확대 레벨
const FOCUS_ZOOM_LEVEL = 6

// mockData의 표기(예: '구로제2동')와 실제 geojson 행정동명(예: '구로2동')이
// 다를 수 있어, '제N동' 형태를 'N동'으로 바꿔서도 한 번 더 찾아본다.
function resolveDongKey(district, dongName) {
  const key = createDongKey(district, dongName)
  return dongBoundsMap[key] ? key : null
}

// 선택된 동의 실제 행정 경계선을 지도 위에 그려서 강조 표시
function highlightDongBoundary(key, districtName) {
  clearSelectedDongPolygon()

  const paths = dongPathsMap[key]
  if (!paths || !kakaoMapInstance) return

  selectedDongPolygon = new window.kakao.maps.Polygon({
    path: paths,
    strokeWeight: 3,
    strokeColor: '#FFFDF8',
    strokeOpacity: 1,
    fillColor: originalPolygonColors[districtName] || '#64748B',
    fillOpacity: 0.45,
  })
  selectedDongPolygon.setZIndex(5)
  selectedDongPolygon.setMap(kakaoMapInstance)
}

function setDistrictFillOpacity(showRecommendedDistricts) {
  const recommendedDistricts = new Set(props.recommendations.map((item) => item.district))
  Object.entries(districtPolygonMap).forEach(([districtName, polygon]) => {
    polygon.setOptions({
      fillOpacity: showRecommendedDistricts && recommendedDistricts.has(districtName) ? 0.65 : 0,
    })
  })
}

// 카드에서 특정 결과를 선택하면 해당 동이 속한 구를 포커싱하고,
// 선택한 동만 반투명하게 표시한다.
function focusOnDong(id) {
  if (!kakaoMapInstance) return

  const target = props.recommendations.find((item) => item.id === id)
  if (!target) return

  const districtBounds = districtBoundsMap[target.district]
  const key = resolveDongKey(target.district, target.dongName)
  if (districtBounds && !districtBounds.isEmpty()) {
    kakaoMapInstance.setBounds(districtBounds)
    kakaoMapInstance.setLevel(FOCUS_ZOOM_LEVEL)
    highlightDongBoundary(key, target.district)
  } else {
    const bounds = dongBoundsMap[key]
    if (bounds && !bounds.isEmpty()) {
      kakaoMapInstance.setBounds(bounds)
      kakaoMapInstance.setLevel(FOCUS_ZOOM_LEVEL)
      highlightDongBoundary(key, target.district)
    } else {
      // GeoJSON에 없는 동(목데이터 등)은 API 좌표 기준으로 이동한다.
      const moveLatLon = new window.kakao.maps.LatLng(target.lat, target.lng)
      kakaoMapInstance.panTo(moveLatLon)
      kakaoMapInstance.setLevel(FOCUS_ZOOM_LEVEL)
      clearSelectedDongPolygon()
    }
  }

  setDistrictFillOpacity(false)
  renderMapLabels()
}

function resetMapView() {
  if (!kakaoMapInstance) return
  clearSelectedDongPolygon()
  setDistrictFillOpacity(true)
  kakaoMapInstance.setCenter(new window.kakao.maps.LatLng(37.5665, 126.978))
  kakaoMapInstance.setLevel(INITIAL_ZOOM_LEVEL)
  renderMapLabels()
}

watch(
  [() => props.focusedAdminDongId, () => props.recommendations],
  ([focusedAdminDongId]) => {
    if (!kakaoMapInstance) return
    const hasFocusedResult =
      focusedAdminDongId != null && props.recommendations.some((item) => item.id === focusedAdminDongId)

    if (hasFocusedResult) focusOnDong(focusedAdminDongId)
    else resetMapView()
  },
  { deep: true },
)

watch(
  () => props.modelValue,
  () => {
    // 비교 선택(v-model) 상태가 바뀌면 뱃지의 선택 표시를 다시 그린다
    if (kakaoMapInstance) {
      renderMapLabels()
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  disposed = true
  // 라우트 이동 시 폴리곤/오버레이가 지도 인스턴스와 함께 누수되는 것을 방지한다.
  clearOverlays()
  Object.values(districtPolygonMap).forEach((polygon) => polygon.setMap(null))
  districtPolygonMap = {}
  districtOutlineList.forEach((outline) => outline.setMap(null))
  districtOutlineList = []
  clearSelectedDongPolygon()
  kakaoMapInstance = null
})
</script>

<template>
  <div class="relative w-full h-full">
    <div class="relative w-full h-full min-h-[480px]">
      <div
        ref="mapContainer"
        class="w-full h-full rounded-xl overflow-hidden shadow-sm border border-border"
      ></div>

      <!-- 지도/geojson 로딩 중엔 빈 화면 대신 스피너를 보여준다 -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 rounded-xl"
      >
        <div
          class="w-8 h-8 rounded-full border-[3px] border-muted border-t-primary animate-spin"
        ></div>
        <p class="text-sm text-muted-foreground">지도를 불러오는 중이에요...</p>
      </div>

      <div
        v-else-if="loadError"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 rounded-xl px-6 text-center"
      >
        <p class="text-sm font-semibold text-foreground">지도를 불러오지 못했어요</p>
        <p class="text-xs text-muted-foreground">네트워크 연결을 확인하고 새로고침해 주세요.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.dong-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Sans KR', sans-serif;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #cbd5e1;
  color: #1e293b;
  font-weight: 600;
  font-size: 13.2px;
  padding: 2.4px 7.2px;
  border-radius: 4.8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.dong-badge:hover) {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
  transform: scale(1.05);
}

:deep(.dong-badge.highlighted) {
  font-weight: 700;
}

:deep(.dong-badge.selected) {
  outline: 2px solid #1565c0;
  outline-offset: 1px;
}
</style>
