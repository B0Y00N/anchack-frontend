<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { MAP_MARKER_SETS } from '@/common/utils/mockData.js'

const props = defineProps({
  dong: { type: String, required: true },
  hash: { type: Number, required: true },
  mode: { type: String, required: true }, // "infra" | "safety" | "transit"
})

const modeLabel = { infra: '생활 인프라', safety: '치안 시설', transit: '교통 시설' }
const set = computed(() => MAP_MARKER_SETS[props.mode])

const active = ref(new Set(set.value.map((c) => c.label)))
function toggleCat(label) {
  const next = new Set(active.value)
  if (next.has(label)) next.delete(label)
  else next.add(label)
  active.value = next
}

// dong/mode/hash가 같으면 항상 같은 마커 배치가 나오도록 하는 시드 기반 난수
function sr(a, b) {
  const x = Math.sin(a * 317 + b * 97 + props.hash * 53) * 43758.5453
  return x - Math.floor(x)
}

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY
const mapElId = `infra-map-${Math.random().toString(36).slice(2)}`

let kakaoMapInstance = null
let dongBoundsMap = {}
let dongPathsMap = {}
let boundaryPolygon = null
let overlays = []
let geoLoaded = false

onMounted(() => {
  loadKakaoMapScript()
})

onBeforeUnmount(() => {
  overlays.forEach((o) => o.setMap(null))
  overlays = []
  if (boundaryPolygon) {
    boundaryPolygon.setMap(null)
    boundaryPolygon = null
  }
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

function resolveDongKey(name) {
  if (dongBoundsMap[name]) return name
  const normalized = name.replace(/제(\d+동)$/, '$1')
  return dongBoundsMap[normalized] ? normalized : name
}

function initMap() {
  const container = document.getElementById(mapElId)
  if (!container) return

  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(37.5665, 126.978),
    level: 5,
  })
  kakaoMapInstance = map

  if (geoLoaded) {
    focusOnCurrentDong()
    return
  }

  fetch('/seoul_dong.geojson')
    .then((res) => res.json())
    .then((geojson) => {
      if (!geojson || !geojson.features) return

      geojson.features.forEach((feature) => {
        const fullName = feature.properties.adm_nm || ''
        const nameParts = fullName.split(' ')
        const dongName = nameParts[nameParts.length - 1]
        if (!dongName) return

        if (!dongBoundsMap[dongName]) dongBoundsMap[dongName] = new window.kakao.maps.LatLngBounds()
        if (!dongPathsMap[dongName]) dongPathsMap[dongName] = []

        const bounds = dongBoundsMap[dongName]
        const coordinates = feature.geometry.coordinates

        function processCoords(coordsArr) {
          const path = []
          coordsArr.forEach((coord) => {
            const latLng = new window.kakao.maps.LatLng(coord[1], coord[0])
            path.push(latLng)
            bounds.extend(latLng)
          })
          return path
        }

        if (feature.geometry.type === 'MultiPolygon') {
          coordinates.forEach((polygon) => {
            dongPathsMap[dongName].push(processCoords(polygon[0]))
          })
        } else {
          dongPathsMap[dongName].push(processCoords(coordinates[0]))
        }
      })

      geoLoaded = true
      focusOnCurrentDong()
    })
    .catch((err) => console.error('GeoJSON 로드 오류:', err))
}

// 줌 레벨을 레벨 5로 살짝 넓혀서 적당한 비율로 보이도록 조정
function focusOnCurrentDong() {
  if (!kakaoMapInstance) return

  nextTick(() => {
    kakaoMapInstance.relayout()

    if (boundaryPolygon) {
      boundaryPolygon.setMap(null)
      boundaryPolygon = null
    }

    const key = resolveDongKey(props.dong)
    const bounds = dongBoundsMap[key]

    if (bounds && !bounds.isEmpty()) {
      kakaoMapInstance.setBounds(bounds, -39.78, -39.78, -39.78, -39.78)

      // 너무 과도하게 확대되는 것을 방지하기 위해 레벨이 너무 낮으면(확대 과다) 5로 고정
      const currentLevel = kakaoMapInstance.getLevel()
      if (currentLevel < 5) {
        kakaoMapInstance.setLevel(6)
      }

      boundaryPolygon = new window.kakao.maps.Polygon({
        path: dongPathsMap[key],
        strokeWeight: 3,
        strokeColor: '#2D7A4F',
        strokeOpacity: 0.9,
        fillColor: '#2D7A4F',
        fillOpacity: 0.12,
      })
      boundaryPolygon.setMap(kakaoMapInstance)
    }

    renderMarkers()
  })
}

function renderMarkers() {
  overlays.forEach((o) => o.setMap(null))
  overlays = []
  if (!kakaoMapInstance) return

  const key = resolveDongKey(props.dong)
  const bounds = dongBoundsMap[key]
  if (!bounds || bounds.isEmpty()) return

  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()

  let seed = 0
  set.value.forEach((cat) => {
    if (!active.value.has(cat.label)) {
      seed += 20
      return
    }
    const count = Math.max(1, cat.baseCount + Math.floor(sr(seed, 7) * 2) - 1)
    for (let i = 0; i < count; i++) {
      const lat = sw.getLat() + sr(seed + i, 1) * (ne.getLat() - sw.getLat())
      const lng = sw.getLng() + sr(seed + i, 2) * (ne.getLng() - sw.getLng())
      const overlay = createMarkerOverlay(lat, lng, cat)
      overlay.setMap(kakaoMapInstance)
      overlays.push(overlay)
    }
    seed += 20
  })
}

function createMarkerOverlay(lat, lng, cat) {
  const el = document.createElement('div')
  el.className = 'infra-pin'
  el.style.setProperty('--pin-color', cat.color)
  el.innerHTML = `
    <span class="infra-pin-label">${cat.emoji ?? ''} ${cat.label}</span>
    <span class="infra-pin-dot"></span>
  `
  return new window.kakao.maps.CustomOverlay({
    position: new window.kakao.maps.LatLng(lat, lng),
    content: el,
    xAnchor: 0.5,
    yAnchor: 1,
  })
}

watch(
  () => [props.dong, props.hash, props.mode],
  () => {
    active.value = new Set(set.value.map((c) => c.label))
    if (kakaoMapInstance) focusOnCurrentDong()
  },
)

watch(active, () => {
  renderMarkers()
})
</script>

<template>
  <div class="bg-card border border-border rounded-2xl overflow-hidden">
    <div class="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
      <h4 class="font-semibold text-foreground text-sm">
        {{ dong }} 주변 {{ modeLabel[mode] }} 지도
      </h4>
      <span class="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
        >모의 데이터 기반</span
      >
    </div>

    <div class="px-5 py-3 border-b border-border/50 flex flex-wrap gap-2">
      <button
        v-for="cat in set"
        :key="cat.label"
        @click="toggleCat(cat.label)"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
        :style="
          active.has(cat.label)
            ? { background: cat.color + '18', borderColor: cat.color, color: cat.color }
            : { background: 'transparent', borderColor: '#D1D5DB', color: '#9CA3AF' }
        "
      >
        <span
          class="w-2 h-2 rounded-full flex-shrink-0 transition-all"
          :style="{ background: active.has(cat.label) ? cat.color : '#D1D5DB' }"
        />
        {{ cat.label }}
      </button>
    </div>

    <div class="relative">
      <div :id="mapElId" class="w-full h-[280px]"></div>
      <div
        v-if="active.size === 0"
        class="absolute inset-0 flex items-center justify-center"
        style="pointer-events: none"
      >
        <p
          class="text-sm text-muted-foreground bg-white/80 px-4 py-2 rounded-xl border border-border"
        >
          표시할 카테고리를 선택해주세요
        </p>
      </div>
      <div
        class="absolute bottom-2.5 left-2.5 text-[9px] text-muted-foreground/70 bg-white/80 px-2 py-0.5 rounded-md"
        style="pointer-events: none"
      >
        {{ dong }} 행정구역 경계
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.infra-pin) {
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  transform: translateY(-2px);
}

:deep(.infra-pin-dot) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--pin-color);
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  margin-top: 2px;
}

:deep(.infra-pin-label) {
  font-size: 9px;
  font-weight: 700;
  color: var(--pin-color);
  background: white;
  padding: 1px 5px;
  border-radius: 4px;
  border: 0.8px solid var(--pin-color);
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
</style>
