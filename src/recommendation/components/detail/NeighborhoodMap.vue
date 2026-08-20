<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { MAP_MARKER_SETS } from '@/common/utils/mockData.js'
import { loadSeoulGeojson } from '@/common/utils/loadSeoulGeojson.js'
import { loadKakaoMap } from '@/common/utils/loadKakaoMap.js'
import { useMapLoadState } from '@/common/composables/useMapLoadState.js'

const props = defineProps({
  dong: { type: String, required: true },
  hash: { type: Number, required: true },
  mode: { type: String, required: true }, // "infra" | "safety" | "transit"
})

const modeLabel = { infra: '생활 인프라', safety: '치안 시설', transit: '교통 시설' }
const set = computed(() => MAP_MARKER_SETS[props.mode])

// 인프라/교통은 카카오맵 실제 장소 데이터를 사용하고,
// 치안은 경찰서/지구대만 실제 데이터이고 CCTV·가로등·안전비상벨은 추정치라 문구를 다르게 표시
const dataBadgeLabel = computed(() =>
  props.mode === 'safety' ? '일부 실제 데이터 · 일부 추정' : '카카오맵 실제 장소 데이터',
)

const active = ref(new Set(set.value.map((c) => c.label)))
function toggleCat(label) {
  const next = new Set(active.value)
  if (next.has(label)) next.delete(label)
  else next.add(label)
  active.value = next
}

// 지도/geojson이 준비되기 전엔 빈 화면 대신 로딩 표시를 보여준다
// (ResultMap.vue / DistrictMap.vue와 동일한 공용 컴포저블 사용)
const { isLoading, loadError, markLoaded, markError } = useMapLoadState()

// dong/mode/hash가 같으면 항상 같은 마커 배치가 나오도록 하는 시드 기반 난수
function sr(a, b) {
  const x = Math.sin(a * 317 + b * 97 + props.hash * 53) * 43758.5453
  return x - Math.floor(x)
}

const mapElId = `infra-map-${Math.random().toString(36).slice(2)}`

// 카테고리별로 실제 카카오맵 장소 데이터를 조회하기 위한 매핑.
// 값은 검색 조건의 배열이다 — "카페/음식점"처럼 이름이 복합인 카테고리는
// 하위 유형 각각을 따로 검색해서 합쳐야 실제로 카페와 음식점이 둘 다 나온다.
// (예전엔 검색 조건을 1개만 넣어서, 카페/음식점은 카페만, 병원/약국은 병원만 조회되던 버그가 있었다)
// code가 있으면 카카오 장소 카테고리 코드로 검색하고, keyword만 있으면 키워드 검색을 사용한다.
// CCTV·가로등·안전비상벨처럼 카카오에 업체/장소로 등록되지 않는 공공시설은
// 실제 장소 데이터가 없으므로 매핑에서 제외하고, 기존 추정(모의) 배치를 그대로 사용한다.
const CATEGORY_SEARCH_TERM = {
  '편의점': [{ code: 'CS2' }],
  '카페/음식점': [{ code: 'FD6' }, { code: 'CE7' }],
  '병원/약국': [{ code: 'HP8' }, { code: 'PM9' }],
  '헬스장': [{ keyword: '헬스장' }],
  '은행': [{ code: 'BK9' }],
  '공원': [{ keyword: '공원' }],
  '백화점': [{ keyword: '백화점' }],
  '대형마트': [{ code: 'MT1' }],
  '경찰서/지구대': [{ keyword: '경찰서' }, { keyword: '지구대' }],
  '지하철역': [{ code: 'SW8' }],
  '버스정류장': [{ keyword: '버스정류장' }],
  '따릉이': [{ keyword: '따릉이 대여소' }],
  '택시승강장': [{ keyword: '택시승강장' }],
}
const MAX_PER_CATEGORY = 5

// Places API 검색이 ERROR(네트워크 문제 등)로 실패한 카테고리 라벨을 담아둔다.
// ZERO_RESULT(그냥 결과 없음)는 정상 상태라 여기 안 들어간다 — 이 목록에 있는
// 카테고리에만 "다시 시도" 버튼이 붙은 오류 안내를 보여준다.
const categorySearchErrors = ref(new Set())

let kakaoMapInstance = null
let placesService = null
let requestToken = 0
// 카테고리 라벨 -> 그 카테고리의 최신 요청 버전 번호.
// requestToken 하나만으로는 "다시 시도" 버튼을 빠르게 두 번 눌렀을 때
// 먼저 시작한 요청도 여전히 유효한 것으로 취급되어 마커가 중복 생성된다.
// 카테고리별로 따로 버전을 매겨, 그 카테고리의 가장 최근 요청만 결과를 반영하게 한다.
let categoryRequestTokens = {}
let dongBoundsMap = {}
let dongPathsMap = {}
let boundaryPolygon = null
// 카테고리 라벨 -> 그 카테고리가 그린 오버레이 배열. 카테고리별로 추적해야
// "다시 시도" 시 그 카테고리 마커만 지우고 새로 그릴 수 있다 (전체를 지우면
// 다른 카테고리 마커까지 깜빡이며 다시 그려져야 해서 비효율적).
let overlaysByCategory = {}
let geoLoaded = false

// 컴포넌트가 이미 언마운트된 뒤에 도착하는 비동기 콜백(SDK 로드, geojson fetch,
// nextTick, Places 검색 결과)이 사라진 컨테이너에 지도를 다시 붙이거나
// 오버레이를 새로 그리는 것을 막기 위한 플래그.
let disposed = false

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
      markError()
    })
})

onBeforeUnmount(() => {
  disposed = true
  requestToken += 1 // 이미 나가있는 Places 검색 응답을 전부 낡은 것으로 무효화
  Object.values(overlaysByCategory).forEach((list) => list.forEach((o) => o.setMap(null)))
  overlaysByCategory = {}
  if (boundaryPolygon) {
    boundaryPolygon.setMap(null)
    boundaryPolygon = null
  }
})

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

  if (window.kakao.maps.services && !placesService) {
    placesService = new window.kakao.maps.services.Places()
  }

  if (geoLoaded) {
    focusOnCurrentDong()
    return
  }

  loadSeoulGeojson()
    .then((geojson) => {
      if (disposed) return
      if (!geojson || !Array.isArray(geojson.features) || geojson.features.length === 0) {
        console.error('GeoJSON 데이터가 비어 있거나 잘못되었습니다.')
        markError()
        return
      }

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
      markError()
    })
}

// 줌 레벨을 레벨 5로 살짝 넓혀서 적당한 비율로 보이도록 조정
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
    markLoaded()
  })
}

function renderMarkers() {
  Object.values(overlaysByCategory).forEach((list) => list.forEach((o) => o.setMap(null)))
  overlaysByCategory = {}
  categorySearchErrors.value = new Set()
  if (!kakaoMapInstance) return

  const key = resolveDongKey(props.dong)
  const bounds = dongBoundsMap[key]
  if (!bounds || bounds.isEmpty()) return

  // 동/카테고리가 바뀌는 도중에 이전 검색 결과가 뒤늦게 그려지지 않도록 토큰으로 구분
  requestToken += 1
  const myToken = requestToken

  let seed = 0
  set.value.forEach((cat) => {
    if (!active.value.has(cat.label)) {
      seed += 20
      return
    }
    renderCategoryMarkers(cat, key, bounds, myToken, seed)
    seed += 20
  })
}

// 카테고리 하나를 그린다. 기존에 그려져 있던 그 카테고리의 오버레이는
// (일반 렌더링이든 재시도든) 먼저 지우고 새로 그려서 중복이 남지 않게 한다.
function renderCategoryMarkers(cat, key, bounds, token, seed = 0) {
  // "다시 시도"를 빠르게 두 번 누르면, 먼저 시작한 요청도 requestToken은 그대로라
  // 여전히 유효한 것으로 취급되어 결과가 두 번 반영될 수 있다. 카테고리별로
  // 별도 버전을 매겨, 그 카테고리의 가장 최근 요청 결과만 반영되게 한다.
  const categoryToken = (categoryRequestTokens[cat.label] ?? 0) + 1
  categoryRequestTokens[cat.label] = categoryToken

  clearCategoryOverlays(cat.label)

  const searchInfos = CATEGORY_SEARCH_TERM[cat.label]
  if (searchInfos && placesService) {
    searchRealPlaces(cat, key, searchInfos, bounds, token, categoryToken)
  } else {
    renderMockMarkersForCategory(cat, key, bounds, seed)
  }
}

function clearCategoryOverlays(label) {
  const existing = overlaysByCategory[label]
  if (existing) {
    existing.forEach((o) => o.setMap(null))
  }
  overlaysByCategory[label] = []
}

// 오류로 실패했던 카테고리 하나만 다시 검색한다 ("다시 시도" 버튼에서 호출).
// 다른 카테고리의 진행 중인 검색에는 영향을 주지 않도록 requestToken은 새로 올리지 않는다
// (카테고리별 중복 방지는 renderCategoryMarkers가 매기는 categoryToken이 담당한다).
function retryCategorySearch(label) {
  if (!kakaoMapInstance) return
  const cat = set.value.find((c) => c.label === label)
  if (!cat) return

  const key = resolveDongKey(props.dong)
  const bounds = dongBoundsMap[key]
  if (!bounds || bounds.isEmpty()) return

  renderCategoryMarkers(cat, key, bounds, requestToken)
}

// ray-casting 알고리즘으로 좌표가 동 경계 폴리곤 안에 있는지 판별한다.
// bounds(사각형)만으로 거르면, 사각형 안이지만 실제 동 경계 밖인 장소가
// 섞여 나올 수 있어 실제 폴리곤(dongPathsMap) 기준으로 한 번 더 걸러낸다.
function isPointInDongPolygon(lat, lng, key) {
  const paths = dongPathsMap[key]
  if (!paths || paths.length === 0) return true // 폴리곤 정보가 없으면 걸러내지 않는다(안전한 폴백)
  return paths.some((ring) => isPointInRing(lat, lng, ring))
}

function isPointInRing(lat, lng, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i].getLat()
    const xi = ring[i].getLng()
    const yj = ring[j].getLat()
    const xj = ring[j].getLng()
    const intersects = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

// 카카오맵 실제 장소 데이터(Places API)로 카테고리별 위치를 찾아 마커로 표시.
// searchInfos는 검색 조건 배열이다 — "카페/음식점"처럼 하위 유형이 여러 개인
// 카테고리는 각 조건을 따로 검색한 뒤 장소 id 기준으로 중복 제거해서 합친다.
function searchRealPlaces(cat, key, searchInfos, bounds, token, categoryToken) {
  const options = { bounds, size: MAX_PER_CATEGORY }
  const collected = new Map() // place.id -> place (중복 제거용)
  let remaining = searchInfos.length
  let hadError = false // ERROR 응답을 하나라도 받았는지 (하나라도 있으면 부분 실패로 안내한다)

  // 언마운트/동 전환(requestToken)뿐 아니라, 같은 카테고리의 더 최신 요청이
  // 이미 시작됐는지(categoryToken)까지 같이 확인해야 "다시 시도" 연타로 인한
  // 중복 렌더링을 막을 수 있다.
  const isCurrentRequest = () =>
    !disposed && token === requestToken && categoryToken === categoryRequestTokens[cat.label]

  const finishIfDone = () => {
    if (remaining > 0) return
    if (!isCurrentRequest()) return

    // ERROR가 하나라도 있었으면, 다른 하위 유형이 성공해서 일부 결과가
    // 나왔더라도 사용자에게 "일부 실패"를 알려준다 (조용히 숨기지 않는다).
    const nextErrors = new Set(categorySearchErrors.value)
    if (hadError) {
      nextErrors.add(cat.label)
    } else {
      nextErrors.delete(cat.label)
    }
    categorySearchErrors.value = nextErrors

    const inBounds = [...collected.values()].filter((place) =>
      isPointInDongPolygon(parseFloat(place.y), parseFloat(place.x), key),
    )

    inBounds.slice(0, MAX_PER_CATEGORY).forEach((place) => {
      const overlay = createMarkerOverlay(
        parseFloat(place.y),
        parseFloat(place.x),
        cat,
        place.place_name,
      )
      overlay.setMap(kakaoMapInstance)
      overlaysByCategory[cat.label].push(overlay)
    })
  }

  searchInfos.forEach((searchInfo) => {
    const handleResult = (data, status) => {
      if (!isCurrentRequest()) return // 언마운트됐거나 오래된(카테고리 기준으로도) 요청 결과는 무시

      if (status === window.kakao.maps.services.Status.ERROR) {
        hadError = true
        console.error(`${cat.label} 장소 검색 실패`)
      } else if (Array.isArray(data)) {
        // OK 또는 ZERO_RESULT는 둘 다 정상 응답이다.
        data.forEach((place) => {
          if (!collected.has(place.id)) collected.set(place.id, place)
        })
      }

      remaining -= 1
      finishIfDone()
    }

    if (searchInfo.code) {
      placesService.categorySearch(searchInfo.code, handleResult, options)
    } else {
      placesService.keywordSearch(searchInfo.keyword, handleResult, options)
    }
  })
}

// 카카오에 업체/장소로 등록되지 않는 공공시설(CCTV, 가로등, 안전비상벨)은
// 실제 위치 데이터를 가져올 수 없어 범위 안에 추정 배치한다. 사각형(bounds)
// 안에서만 뽑으면 오목한 경계나 MultiPolygon 동에서는 실제 동 밖에 찍힐 수
// 있어, 실제 폴리곤(isPointInDongPolygon) 안에 들어오는 좌표만 채택한다.
function renderMockMarkersForCategory(cat, key, bounds, seed) {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  const count = Math.max(1, cat.baseCount + Math.floor(sr(seed, 7) * 2) - 1)

  let placed = 0
  for (let attempt = 0; placed < count && attempt < count * 20; attempt++) {
    const lat = sw.getLat() + sr(seed + attempt, 1) * (ne.getLat() - sw.getLat())
    const lng = sw.getLng() + sr(seed + attempt, 2) * (ne.getLng() - sw.getLng())
    if (!isPointInDongPolygon(lat, lng, key)) continue

    const overlay = createMarkerOverlay(lat, lng, cat)
    overlay.setMap(kakaoMapInstance)
    overlaysByCategory[cat.label].push(overlay)
    placed += 1
  }
}

function truncateLabel(text, max = 12) {
  if (!text) return text
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function createMarkerOverlay(lat, lng, cat, placeName) {
  const el = document.createElement('div')
  el.className = 'infra-pin'
  el.style.setProperty('--pin-color', cat.color)
  const labelText = placeName ? truncateLabel(placeName) : cat.label

  // placeName은 카카오 Places API 응답값(업주가 직접 등록하는 장소명)이라
  // 신뢰할 수 없는 외부 입력이다. innerHTML 대신 textContent로 넣어 XSS를 막는다.
  const label = document.createElement('span')
  label.className = 'infra-pin-label'
  label.textContent = `${cat.emoji ?? ''} ${labelText}`

  const dot = document.createElement('span')
  dot.className = 'infra-pin-dot'

  el.append(label, dot)

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
      <span class="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{{
        dataBadgeLabel
      }}</span>
    </div>

    <p v-if="mode === 'safety'" class="px-5 pt-2 text-[10px] text-muted-foreground">
      경찰서/지구대는 실제 위치를 표시하며, CCTV·가로등·안전비상벨은 공개된 장소 데이터가 없어 범위
      내 추정 위치로 표시됩니다.
    </p>

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

    <!-- Places 검색이 ERROR로 실패한 카테고리에만 재시도 안내를 보여준다.
         (단순 결과 없음은 정상이라 여기 안 뜬다) -->
    <div
      v-if="categorySearchErrors.size > 0"
      class="px-5 py-2 border-b border-border/50 flex flex-wrap gap-2"
    >
      <div
        v-for="label in categorySearchErrors"
        :key="label"
        role="alert"
        class="flex items-center gap-2 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-full pl-2.5 pr-1.5 py-1"
      >
        <span>{{ label }} 검색에 실패했어요</span>
        <button
          type="button"
          @click="retryCategorySearch(label)"
          class="font-semibold underline decoration-dotted underline-offset-2 px-1"
        >
          다시 시도
        </button>
      </div>
    </div>

    <div class="relative">
      <div :id="mapElId" class="w-full h-[320px] sm:h-[420px] lg:h-[520px]"></div>
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
