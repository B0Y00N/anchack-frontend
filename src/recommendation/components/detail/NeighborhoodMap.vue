<script>
import { getAdminDongPlaces } from '@/region/api/neighborhood.js'

// 진짜 모듈 스코프 캐시. <script setup> 최상단에 두면 컴포넌트 인스턴스(=탭 하나)가
// 새로 마운트될 때마다 다시 실행돼 캐시가 매번 초기화되므로, 인스턴스와 무관하게
// 딱 한 번만 평가되는 일반 <script> 블록에 둬야 탭을 오가도(통근<->치안<->생활 인프라)
// 같은 동은 재요청되지 않는다.
const placesCache = new Map() // adminDongId -> Promise<Place[]>
function fetchAllPlaces(adminDongId) {
  if (!placesCache.has(adminDongId)) {
    const promise = getAdminDongPlaces(adminDongId).then((res) => res.data.data)
    // 실패를 그대로 캐싱하면 이후 같은 동을 다시 열어도 재시도가 안 된다.
    // 캐시에는 안 남기고, 호출부(fetchAllPlaces를 부른 쪽)에서 reject를 그대로 받게 둔다.
    promise.catch(() => placesCache.delete(adminDongId))
    placesCache.set(adminDongId, promise)
  }
  return placesCache.get(adminDongId)
}
</script>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import { loadSeoulGeojson } from '@/common/utils/loadSeoulGeojson.js'
import { loadKakaoMap } from '@/common/utils/loadKakaoMap.js'

const props = defineProps({
  dong: { type: String, required: true },
  // 경계 지도 자체는 GeoJSON만으로 그릴 수 있다. DB에 아직 등록되지 않은 동도
  // 지도 경계는 보여주고, 장소 핀 조회만 생략하기 위해 null을 허용한다.
  adminDongId: { type: Number, default: null },
  hash: { type: Number, required: true },
  mode: { type: String, required: true }, // "infra" | "safety" | "transit"
  focusZoomLevel: { type: Number, default: 4 },
  maxZoomLevel: { type: Number, default: 4 },
  showPlaceNames: { type: Boolean, default: true },
  boundaryStrokeWeight: { type: Number, default: 1 },
  boundaryFillOpacity: { type: Number, default: 0.12 },
})

const modeLabel = { infra: '생활 인프라', safety: '치안 시설', transit: '교통 시설' }

// 화면 카테고리 <-> places.category(DB enum) 매핑 (API_USER_CONDITIONS_REVISION_REQUEST.md P2 참고).
// anonymous: true인 카테고리는 name이 사람이 읽을 만한 값이 아니라(예: CCTV 관리번호)
// 마커 라벨에 장소명 대신 카테고리명을 쓴다.
const CATEGORY_CONFIG = {
  infra: [
    { label: '편의점', color: '#52B37A', dbCategories: ['CONVENIENCE_STORE'] },
    { label: '카페', color: '#C47C3A', dbCategories: ['CAFE'] },
    { label: '음식점', color: '#B85C38', dbCategories: ['RESTAURANT'] },
    { label: '병원', color: '#E05555', dbCategories: ['HOSPITAL'] },
    { label: '약국', color: '#5B9BD5', dbCategories: ['PHARMACY'] },
    { label: '헬스장', color: '#2D7A4F', dbCategories: ['GYM'] },
    { label: '은행', color: '#7B68A6', dbCategories: ['BANK'] },
    { label: '공원', color: '#4A9E6B', dbCategories: ['PARK'] },
    { label: '백화점', color: '#B03A8C', dbCategories: ['DEPARTMENT_STORE'] },
    { label: '대형마트', color: '#D97706', dbCategories: ['MART'] },
  ],
  safety: [
    { label: 'CCTV', color: '#546E7A', dbCategories: ['CCTV'], anonymous: true },
    {
      label: '가로등',
      color: '#F59E0B',
      dbCategories: ['STREET_LIGHT'],
      anonymous: true,
    },
    { label: '경찰서/지구대', color: '#1565C0', dbCategories: ['POLICE'] },
    {
      label: '안전비상벨',
      color: '#E53935',
      dbCategories: ['SAFETY_BELL'],
      anonymous: true,
    },
  ],
  transit: [
    { label: '지하철역', color: '#1976D2', dbCategories: ['SUBWAY_STATION'] },
    { label: '버스정류장', color: '#E64A19', dbCategories: ['BUS_STOP'] },
  ],
}
// CCTV처럼 한 동에 몇 백 개씩 있는 카테고리를 다 찍으면 지도가 못 알아볼 정도로 빽빽해져서
// 카테고리당 렌더링 개수를 여기서 제한한다(서버는 전체를 다 내려줌).
const MAX_MARKERS_PER_CATEGORY = 30
const set = computed(() => CATEGORY_CONFIG[props.mode])

// 처음에는 핀을 표시하지 않고, 카테고리를 선택한 경우에만 해당 종류의 핀을 보인다.
// 지도 위 라벨이 겹치는 것을 막기 위해 동시에 하나의 카테고리만 활성화할 수 있다.
const active = ref(new Set())
function toggleCat(label) {
  active.value = active.value.has(label) ? new Set() : new Set([label])
}

// 지도/geojson/장소 데이터가 준비되기 전엔 빈 화면 대신 로딩 표시를 보여준다
const isLoading = ref(true)
const loadError = ref(false)
const placesError = ref(false)

const mapElId = `infra-map-${Math.random().toString(36).slice(2)}`

let kakaoMapInstance = null
let dongBoundsMap = {}
let dongPathsMap = {}
let boundaryPolygon = null
let overlays = []
let geoLoaded = false
let mapResizeObserver = null

const allPlaces = ref([])

// 컴포넌트가 이미 언마운트된 뒤에 도착하는 비동기 콜백(SDK 로드, geojson fetch,
// nextTick, places 조회 결과)이 사라진 컨테이너에 지도를 다시 붙이거나
// 오버레이를 새로 그리는 것을 막기 위한 플래그.
let disposed = false

// adminDongId가 바뀔 수 있는 채로 컴포넌트 인스턴스가 재사용되는 경우(상세 페이지가
// key 없이 n만 바뀌며 재사용될 때)가 있어서, 응답이 도착한 시점에도 여전히 같은 동을
// 보고 있는 요청인지 확인한 뒤에만 화면에 반영한다(늦게 온 이전 동 응답이 최신 화면을
// 덮어쓰는 것을 방지).
function loadPlacesFor(adminDongId) {
  placesError.value = false
  // 동이 바뀌면 다음 응답이 도착하기 전까지 이전 동의 핀이 남지 않게 비운다.
  allPlaces.value = []
  if (adminDongId == null) {
    return
  }

  fetchAllPlaces(adminDongId)
    .then((places) => {
      if (disposed || props.adminDongId !== adminDongId) return
      allPlaces.value = places
      if (kakaoMapInstance) renderMarkers()
    })
    .catch(() => {
      if (disposed || props.adminDongId !== adminDongId) return
      placesError.value = true
    })
}

onMounted(() => {
  // 지도 컴포넌트마다 각자 스크립트를 추가하면 중복 로드로 간헐적 실패가
  // 생길 수 있어, 앱 전체에서 공유하는 loadKakaoMap() 싱글턴을 사용한다.
  loadKakaoMap()
    .then(() => {
      if (disposed) return
      initMap()
    })
    .catch((err) => {
      if (disposed) return
      console.error('카카오맵 스크립트 로드 실패', err)
      isLoading.value = false
      loadError.value = true
    })

  loadPlacesFor(props.adminDongId)
})

onBeforeUnmount(() => {
  disposed = true
  mapResizeObserver?.disconnect()
  mapResizeObserver = null
  overlays.forEach((o) => o.setMap(null))
  overlays = []
  if (boundaryPolygon) {
    boundaryPolygon.setMap(null)
    boundaryPolygon = null
  }
})

function resolveDongKey(name) {
  if (dongBoundsMap[name]) return name

  // 화면/DB는 "상계3,4동"처럼 쉼표를 쓰고 GeoJSON은 "상계3·4동"처럼
  // 가운뎃점을 쓰는 경우가 있다. 경계 검색에서는 세 표기를 같은 이름으로 본다.
  const normalize = (dongName) =>
    String(dongName ?? '')
      .replace(/제(\d+동)$/, '$1')
      .replace(/[\s,.·ㆍ]/g, '')
  const normalized = normalize(name)
  return Object.keys(dongBoundsMap).find((key) => normalize(key) === normalized) ?? name
}

function initMap() {
  const container = document.getElementById(mapElId)
  if (!container) return

  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(37.5665, 126.978),
    level: 5,
    disableDoubleClickZoom: true,
  })
  kakaoMapInstance = map
  // 카카오맵은 숫자가 작을수록 확대된다. 화면별 허용 범위 안에서만 지도를 살펴본다.
  map.setZoomable(true)
  map.setMinLevel(1)
  map.setMaxLevel(props.maxZoomLevel)

  // 탭 전환·반응형 레이아웃 변경으로 지도 컨테이너의 높이가 바뀔 때 카카오맵 내부
  // 캔버스도 함께 다시 계산한다. 이 호출이 없으면 컨테이너만 커지고 지도는 이전
  // 크기에 머물러, 높이 변경이 화면에서 반영되지 않는 경우가 있다.
  mapResizeObserver?.disconnect()
  mapResizeObserver = new ResizeObserver(() => {
    if (!disposed && kakaoMapInstance) kakaoMapInstance.relayout()
  })
  mapResizeObserver.observe(container)

  if (geoLoaded) {
    focusOnCurrentDong()
    return
  }

  loadSeoulGeojson()
    .then((geojson) => {
      if (disposed) return
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
      if (disposed) return
      focusOnCurrentDong()
    })
    .catch((err) => {
      if (disposed) return
      console.error('GeoJSON 로드 오류:', err)
      isLoading.value = false
      loadError.value = true
    })
}

function focusOnCurrentDong() {
  if (!kakaoMapInstance) return

  nextTick(() => {
    if (disposed) return
    kakaoMapInstance.relayout()

    if (boundaryPolygon) {
      boundaryPolygon.setMap(null)
      boundaryPolygon = null
    }

    const key = resolveDongKey(props.dong)
    const bounds = dongBoundsMap[key]

    if (bounds && !bounds.isEmpty()) {
      kakaoMapInstance.setBounds(bounds, -39.78, -39.78, -39.78, -39.78)

      // setBounds로 동의 중심을 맞춘 다음, 동네 시설을 보기 좋은 확대 비율로 조정한다.
      kakaoMapInstance.setLevel(props.focusZoomLevel)

      boundaryPolygon = new window.kakao.maps.Polygon({
        path: dongPathsMap[key],
        strokeWeight: props.boundaryStrokeWeight,
        strokeColor: '#47804a',
        strokeOpacity: 0.5,
        fillColor: '#2D7A4F',
        fillOpacity: props.boundaryFillOpacity,
      })
      boundaryPolygon.setMap(kakaoMapInstance)
    }

    renderMarkers()
    isLoading.value = false
  })
}

function resetMapFocus() {
  if (!kakaoMapInstance) return

  const key = resolveDongKey(props.dong)
  const bounds = dongBoundsMap[key]
  if (!bounds || bounds.isEmpty()) return

  // 이 버튼은 이미 그려진 경계·핀을 다시 만들지 않고, 지도 시점만 초기 상태로 돌린다.
  // 그래야 반복 클릭해도 CustomOverlay 이름표의 레이아웃이 흔들리지 않는다.
  kakaoMapInstance.setBounds(bounds, -39.78, -39.78, -39.78, -39.78)
  kakaoMapInstance.setLevel(props.focusZoomLevel)
}

function renderMarkers() {
  overlays.forEach((o) => o.setMap(null))
  overlays = []
  if (!kakaoMapInstance) return

  set.value.forEach((cat) => {
    if (!active.value.has(cat.label)) return

    allPlaces.value
      .filter((p) => cat.dbCategories.includes(p.category))
      .slice(0, MAX_MARKERS_PER_CATEGORY)
      .forEach((place) => {
        const overlay = createMarkerOverlay(
          place.lat,
          place.lng,
          cat,
          cat.anonymous ? null : place.name,
          props.showPlaceNames,
        )
        overlay.setMap(kakaoMapInstance)
        overlays.push(overlay)
      })
  })
}

function formatMarkerLabel(placeName) {
  // 이름표는 한 줄로 고정하므로, 데이터에 섞인 공백과 기호 뒤 공백만 정리한다.
  return placeName
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/([.·ㆍ/])(?=\S)/g, '$1 ')
    .replace(/(\S)\(/g, '$1 (')
}

function createMarkerOverlay(lat, lng, cat, placeName, showLabel) {
  const el = document.createElement('div')
  el.className = 'infra-pin'
  el.style.setProperty('--pin-color', cat.color)
  const dot = document.createElement('span')
  dot.className = 'infra-pin-dot'

  if (showLabel) {
    const labelText = placeName ? formatMarkerLabel(placeName) : cat.label
    // placeName은 외부 데이터 소스(공공데이터 등)에서 온 값이라 신뢰할 수 없는 입력이다.
    // innerHTML 대신 textContent로 넣어 XSS를 막는다.
    const label = document.createElement('span')
    label.className = 'infra-pin-label'
    label.textContent = labelText
    // 카카오맵 CustomOverlay는 지도 이동 시 콘텐츠를 별도 레이어로 재배치한다.
    // 이때 외부 CSS의 줄바꿈 규칙이 흔들리지 않도록, 이름표의 핵심 레이아웃은
    // 요소 자체에 고정한다. 긴 이름은 가로로 유지해 한 글자씩 세로로 쪼개지지 않는다.
    label.style.display = 'inline-block'
    label.style.width = 'max-content'
    label.style.maxWidth = 'none'
    label.style.whiteSpace = 'nowrap'
    label.style.wordBreak = 'keep-all'
    label.style.overflowWrap = 'normal'
    el.append(label)
  }
  el.append(dot)

  return new window.kakao.maps.CustomOverlay({
    position: new window.kakao.maps.LatLng(lat, lng),
    content: el,
    xAnchor: 0.5,
    yAnchor: 1,
  })
}

watch(
  () => [props.dong, props.adminDongId, props.hash, props.mode],
  () => {
    active.value = new Set()
    loadPlacesFor(props.adminDongId)
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
      <button
        type="button"
        @click="resetMapFocus"
        class="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        title="선택한 동으로 다시 이동"
      >
        <RotateCcw :size="12" /> 선택 동으로
      </button>
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

    <div
      v-if="placesError"
      class="px-5 py-2.5 border-b border-amber-200 bg-amber-50 flex items-center justify-between gap-3"
    >
      <p class="text-xs text-amber-800">장소 정보를 불러오지 못했어요.</p>
      <button
        @click="loadPlacesFor(adminDongId)"
        class="text-xs font-semibold text-amber-800 underline flex-shrink-0"
      >
        다시 시도
      </button>
    </div>

    <div class="relative">
      <div :id="mapElId" class="w-full h-[480px] sm:h-[630px] lg:h-[780px]"></div>
      <div
        v-if="isLoading"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card"
      >
        <div
          class="w-8 h-8 rounded-full border-[3px] border-muted border-t-primary animate-spin"
        ></div>
        <p class="text-sm text-muted-foreground">지도를 불러오는 중이에요...</p>
      </div>
      <div
        v-else-if="loadError"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card px-6 text-center"
      >
        <p class="text-sm font-semibold text-foreground">지도를 불러오지 못했어요</p>
        <p class="text-xs text-muted-foreground">네트워크 연결을 확인하고 새로고침해 주세요.</p>
      </div>
      <div
        v-if="!isLoading && active.size === 0"
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
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--pin-color);
  border: 3px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  margin-top: 3px;
}

:deep(.infra-pin-label) {
  min-width: 42px;
  font-size: 11px;
  font-weight: 700;
  color: #1f2937;
  background: white;
  padding: 1px 5px;
  border-radius: 4px;
  border: 0.8px solid var(--pin-color);
  line-height: 1.3;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
</style>
