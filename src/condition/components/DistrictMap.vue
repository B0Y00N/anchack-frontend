<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'
import { loadSeoulGeojson } from '@/common/utils/loadSeoulGeojson.js'
import { loadKakaoMap } from '@/common/utils/loadKakaoMap.js'
import { buildDistrictOutlinePaths } from '@/common/utils/buildDistrictOutlinePaths.js'
import { useMapLoadState } from '@/common/composables/useMapLoadState.js'

const props = defineProps({
  modelValue: { type: Array, required: true },
  max: { type: Number, default: 2 },
})
const emit = defineEmits(['update:modelValue'])

const hoveredDistrict = ref(null)
// 지도/geojson이 준비되기 전엔 빈 영역 대신 로딩·오류 표시를 보여준다
// (ResultMap.vue / NeighborhoodMap.vue와 동일한 공용 컴포저블 사용)
const { isLoading, loadError, markLoaded, markError } = useMapLoadState()

let districtPolygonMap = {}
let originalPolygonColors = {}
let complementaryPolygonColors = {}
let kakaoMapInstance = null
let districtOutlineList = []

// document.getElementById('step-map') 하드코딩 충돌 방지를 위한 template ref 사용
const mapContainer = ref(null)

const RAINBOW_25_COLORS = [
  '#C9675B', '#D38A4C', '#C8A44A', '#6F9876', '#5E9FA5',
  '#5E83B3', '#8A6AA8', '#C26F8C', '#8A7B5B', '#C76E4D',
  '#967852', '#5B8B68', '#B7825A', '#76639A', '#AD789B',
  '#B85D63', '#BE8744', '#52968E', '#667EAF', '#895B9F',
  '#C97D9E', '#5D7F76', '#5C9ABB', '#B86C78', '#748168',
]

function getComplementaryColor(hex) {
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const r = 255 - parseInt(cleanHex.substring(0, 2), 16)
  const g = 255 - parseInt(cleanHex.substring(2, 4), 16)
  const b = 255 - parseInt(cleanHex.substring(4, 6), 16)
  return (
    '#' +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

function isSelected(id) {
  return props.modelValue.includes(id)
}

function toggle(id) {
  if (isSelected(id)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((x) => x !== id),
    )
  } else if (props.modelValue.length < props.max) {
    emit('update:modelValue', [...props.modelValue, id])
  }
}

function updateDistrictStyles() {
  Object.keys(districtPolygonMap).forEach((sigName) => {
    const polygon = districtPolygonMap[sigName]
    if (!polygon) return

    const fullDistrictName = sigName.endsWith('구') ? sigName : sigName + '구'
    const sel = isSelected(fullDistrictName)
    const hov = hoveredDistrict.value === fullDistrictName
    const hasSelection = props.modelValue.length > 0
    const isMaxReached = props.modelValue.length >= props.max
    const isDisabled = !sel && isMaxReached

    let fillColor = originalPolygonColors[sigName] || '#FF0000'
    let fillOpacity = hasSelection ? (sel ? 0.8 : 0) : 0.8

    if (hasSelection && isDisabled) {
      fillColor = '#E2E8F0'
      fillOpacity = 0
    } else if (hov && (!hasSelection || sel)) {
      fillColor = complementaryPolygonColors[sigName] || '#00FFFF'
      fillOpacity = 0.95
    }

    polygon.setOptions({
      fillColor: fillColor,
      fillOpacity: fillOpacity,
    })
  })
}

watch([() => props.modelValue, hoveredDistrict], updateDistrictStyles)

// 컴포넌트 언마운트 후 비동기 콜백 실행 방지 플래그
let disposed = false

onMounted(() => {
  loadKakaoMap()
    .then(() => {
      if (disposed) return
      initMap()
    })
    .catch((err) => {
      if (disposed) return
      console.error('카카오맵 스크립트 로드 실패', err)
      markError()
    })
})

onBeforeUnmount(() => {
  disposed = true
  Object.values(districtPolygonMap).forEach((polygon) => polygon.setMap(null))
  districtPolygonMap = {}
  kakaoMapInstance = null
})

function initMap() {
  const container = mapContainer.value
  if (!container) return

  districtPolygonMap = {}
  originalPolygonColors = {}
  complementaryPolygonColors = {}
  districtOutlineList.forEach((outline) => outline.setMap(null))
  districtOutlineList = []

  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(37.5665, 126.978),
    level: 9, // 첫 번째 코드의 지도 레벨 유지 (필요시 10으로 변경 가능)
    disableDoubleClickZoom: true,
  })
  kakaoMapInstance = map

  map.setZoomable(false)
  map.setDraggable(false)
  map.setCopyrightPosition(window.kakao.maps.CopyrightPosition.BOTTOMRIGHT, true)

  setTimeout(() => {
    if (disposed) return
    map.relayout()
  }, 100)

  loadSeoulGeojson()
    .then((geojson) => {
      if (disposed) return
      if (!geojson || !geojson.features) {
        markError()
        return
      }

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
      const districtCenterCalc = {}

      geojson.features.forEach((feature) => {
        const fullName = feature.properties.adm_nm || ''
        const nameParts = fullName.split(' ')
        const sigName = nameParts[1]
        if (!sigName) return

        if (!districtPathsMap[sigName]) {
          districtPathsMap[sigName] = []
          districtCenterCalc[sigName] = { totalLat: 0, totalLng: 0, count: 0 }
        }

        const coordinates = feature.geometry.coordinates

        function processCoords(coordsArr) {
          const path = []
          coordsArr.forEach((coord) => {
            const lat = coord[1]
            const lng = coord[0]
            path.push(new window.kakao.maps.LatLng(lat, lng))
            districtCenterCalc[sigName].totalLat += lat
            districtCenterCalc[sigName].totalLng += lng
            districtCenterCalc[sigName].count++
          })
          return path
        }

        if (feature.geometry.type === 'MultiPolygon') {
          coordinates.forEach((polygon) => {
            districtPathsMap[sigName].push(processCoords(polygon[0]))
          })
        } else {
          districtPathsMap[sigName].push(processCoords(coordinates[0]))
        }
      })

      Object.keys(districtPathsMap).forEach((sigName) => {
        const paths = districtPathsMap[sigName]
        const assignedColor = districtColorMap[sigName] || '#FF0000'
        const fullDistrictName = sigName.endsWith('구') ? sigName : sigName + '구'

        originalPolygonColors[sigName] = assignedColor
        complementaryPolygonColors[sigName] = getComplementaryColor(assignedColor)

        const polygon = new window.kakao.maps.Polygon({
          path: paths,
            strokeWeight: 2,
            strokeColor: '#FFFDF8',
            strokeOpacity: 0.95,
          fillColor: assignedColor,
          fillOpacity: 0.8,
        })

        districtPolygonMap[sigName] = polygon

        window.kakao.maps.event.addListener(polygon, 'mouseover', () => {
          hoveredDistrict.value = fullDistrictName
        })
        window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
          if (hoveredDistrict.value === fullDistrictName) {
            hoveredDistrict.value = null
          }
        })
        polygon.setMap(map)

        const cData = districtCenterCalc[sigName]
        if (cData && cData.count > 0) {
          const centerLat = cData.totalLat / cData.count
          const centerLng = cData.totalLng / cData.count

          const contentDiv = document.createElement('div')
          contentDiv.className = 'district-label'
          contentDiv.innerText = fullDistrictName
          contentDiv.addEventListener('click', (e) => {
            e.stopPropagation()
            const isMax = props.modelValue.length >= props.max
            if (isMax && !isSelected(fullDistrictName)) return
            toggle(fullDistrictName)
          })

          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(centerLat, centerLng),
            content: contentDiv,
            xAnchor: 0.5,
            yAnchor: 0.5,
          })
          customOverlay.setMap(map)
        }
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
          outline.setMap(map)
          districtOutlineList.push(outline)
        })
      })

      updateDistrictStyles()

      if (disposed) return
      markLoaded()
    })
    .catch((err) => {
      if (disposed) return
      console.error('GeoJSON 로드 오류:', err)
      markError()
    })
}
</script>

<template>
  <div class="relative w-full">
    <!-- 상단 호버 안내 배너 -->
    <div
      v-if="hoveredDistrict"
      class="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-foreground text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none shadow-lg"
    >
      {{ hoveredDistrict }}
      {{
        isSelected(hoveredDistrict)
          ? '✓ 선택됨'
          : modelValue.length >= max
            ? '(최대 선택)'
            : '— 클릭하여 선택'
      }}
    </div>

    <!-- 지도 컨테이너 및 로딩/에러 레이어 -->
  <div class="relative w-full" style="height: 540px">
      <div ref="mapContainer" class="w-full h-full rounded-xl overflow-hidden"></div>

      <!-- 로딩 중 스피너 표시 -->
      <div
        v-if="isLoading"
        role="status"
        aria-live="polite"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 rounded-xl"
      >
        <div
          class="w-6 h-6 rounded-full border-[3px] border-muted border-t-primary animate-spin"
        ></div>
        <p class="text-xs text-muted-foreground">지도를 불러오는 중이에요...</p>
      </div>

      <!-- 에러 발생 시 안내 표시 -->
      <div
        v-else-if="loadError"
        role="alert"
        class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/90 rounded-xl px-4 text-center"
      >
        <p class="text-xs font-semibold text-foreground">지도를 불러오지 못했어요</p>
        <p class="text-[11px] text-muted-foreground">새로고침해 주세요.</p>
      </div>
    </div>

    <!-- 하단 선택된 목록 및 카운트 -->
    <div class="flex items-center justify-between mt-3">
      <div class="flex flex-wrap gap-2">
        <span v-if="modelValue.length === 0" class="text-xs text-muted-foreground"
        >서울 전 지역 대상</span
        >
        <button
          v-for="id in modelValue"
          :key="id"
          @click="
            emit(
              'update:modelValue',
              modelValue.filter((x) => x !== id),
            )
          "
          class="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full"
        >
          {{ id }} <X :size="11" />
        </button>
      </div>
      <span class="text-xs text-muted-foreground">{{ modelValue.length }}/{{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
:deep(.district-label) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #cbd5e1;
  color: #1e293b;
  font-weight: 600;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

:deep(.district-label:hover) {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
  transform: scale(1.05);
}
</style>
