<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, ChevronLeft, ChevronRight, Map } from 'lucide-vue-next'
import ExploreHeader from '@/region/components/ExploreHeader.vue'
import ExploreTabs from '@/region/components/ExploreTabs.vue'
import ReviewWriteModal from '@/review/components/ReviewWriteModal.vue'
import LoginRequiredModal from '@/common/components/LoginRequiredModal.vue'
import { loadSeoulGeojson } from '@/common/utils/loadSeoulGeojson.js'
import { loadKakaoMap } from '@/common/utils/loadKakaoMap.js'
import { buildDistrictOutlinePaths } from '@/common/utils/buildDistrictOutlinePaths.js'
import StarDisplay from '@/common/components/StarDisplay.vue'
import BaseToast from '@/common/components/BaseToast.vue'
import { DONG_DATA } from '@/common/utils/mockData'
import { useNeighborhoodStore } from '@/region/stores/useNeighborhoodStore'
import { useMyPageStore } from '@/mypage/stores/useMyPageStore'
import { useAuthStore } from '@/user/stores/useAuthStore'
import { useDongStats } from '@/region/composables/useDongStats'
import { getAdminDong, getReviewStatsByGu } from '@/region/api/neighborhood.js'
import { getReviews } from '@/review/api/review.js'
import { mapReviewResponse } from '@/review/constants.js'
import { getErrorMessage } from '@/common/api/axios.js'

const route = useRoute()
const router = useRouter()
const nbhd = useNeighborhoodStore()
/*
 * [수정] 동 상세 화면의 "저장" 버튼(isDongSaved / toggleSaveDong)이 mypage store를
 * 참조하고 있었는데 정작 이 파일에서 useMyPageStore를 import/호출하지 않아서
 * mypage가 정의되지 않은 상태였다. 그 결과 동을 선택할 때마다
 * "ReferenceError: mypage is not defined"가 발생해 리뷰 탭을 포함한 동 상세
 * 화면 전체가 렌더링되지 않았다.
 */
const mypage = useMyPageStore()
const auth = useAuthStore()

const selectedDistrict = computed({
  get: () => route.params.district || null,
  set: (d) => (d ? router.push(`/explore/${d}`) : router.push('/explore')),
})
const selectedDong = computed(() => route.params.dong || null)

const districtData = computed(() =>
  selectedDistrict.value ? (DONG_DATA[selectedDistrict.value] ?? null) : null,
)

// seoul_dong.geojson에서 직접 추출한 구별 행정동 전체 목록 (mockData의 DONG_DATA.dong은
// 일부만 담긴 샘플이라 목록이 누락되는 문제가 있어, 실제 목록은 geojson 기준으로 사용한다)
const geojsonDongMap = ref({})
const dongList = computed(() => {
  if (!selectedDistrict.value) return []
  return geojsonDongMap.value[selectedDistrict.value] ?? districtData.value?.dong ?? []
})
function selectDong(dong) {
  router.push(`/explore/${selectedDistrict.value}/${dong}`)
}

function backToDistrict() {
  router.push(`/explore/${selectedDistrict.value}`)
}

/*
 * 구를 선택했을 때, 동 목록 각각에 실제 DB에 저장된 리뷰 개수/평균 별점을 매핑해
 * 보여준다. 동마다 admin_dong_id 조회 + 리뷰 조회를 따로 하면 동이 많은 구에서
 * 요청이 수십 개씩 나가므로, 백엔드에서 구 단위로 한 번에 집계해주는
 * /api/admin-dongs/review-stats를 사용한다.
 * { 동이름: { count, avg } } 형태로 저장한다.
 */
const dongReviewStats = ref({})
const dongReviewStatsLoading = ref(false)

async function loadDongReviewStats(district) {
  if (!district) {
    dongReviewStats.value = {}
    return
  }

  dongReviewStatsLoading.value = true

  try {
    const res = await getReviewStatsByGu(district)

    // 응답을 기다리는 사이에 사용자가 다른 구를 선택했다면, 늦게 도착한 이전 구
    // 결과로 최신 화면을 덮어쓰지 않는다.
    if (selectedDistrict.value !== district) return

    dongReviewStats.value = Object.fromEntries(
      res.data.map((row) => [
        row.dongName,
        { count: row.reviewCount, avg: row.avgRating ?? 0 },
      ]),
    )
  } catch (error) {
    console.error(`${district} 리뷰 요약 조회 실패:`, error.response?.data || error)
    if (selectedDistrict.value === district) dongReviewStats.value = {}
  } finally {
    if (selectedDistrict.value === district) dongReviewStatsLoading.value = false
  }
}

watch(selectedDistrict, (district) => loadDongReviewStats(district), { immediate: true })

// 선택된 구 전체의 리뷰 요약(총 리뷰 개수, 평균 별점). 동별 평균값을 리뷰 개수로
// 가중 평균하면 전체 평균과 정확히 같아진다.
const districtReviewSummary = computed(() => {
  const stats = Object.values(dongReviewStats.value)
  const totalCount = stats.reduce((sum, s) => sum + s.count, 0)

  if (totalCount === 0) return { count: 0, avg: 0 }

  const totalScore = stats.reduce((sum, s) => sum + s.avg * s.count, 0)
  return { count: totalCount, avg: totalScore / totalCount }
})

// ── 동 상세 화면 ──
const showReviewForm = ref(false)
const saveToast = ref(null)

const dongStats = computed(() =>
  selectedDong.value ? useDongStats(selectedDistrict.value, selectedDong.value) : null,
)

// 선택된 동의 실제 admin_dong_id 정보 (백엔드 /api/admin-dongs 조회 결과)
const adminDong = ref(null)
// 선택된 동의 실제 리뷰 목록 (백엔드 /api/reviews 조회 결과, mapReviewResponse로 변환됨)
const dongReviewList = ref([])
const reviewsLoading = ref(false)
const reviewsError = ref('')

async function loadDongReviews(district, dong) {
  if (!district || !dong) {
    adminDong.value = null
    dongReviewList.value = []
    reviewsError.value = ''
    return
  }

  reviewsLoading.value = true
  reviewsError.value = ''

  try {
    // 1) 화면에서 다루는 "구 이름 + 동 이름" 문자열을 실제 admin_dong_id로 변환
    // GeoJSON은 "상계3·4동", 화면 목록은 "상계3,4동"처럼 표기하지만 DB에는
    // "상계3.4동"으로 저장된 동이 있다. DB 조회에만 구분기호를 점으로 통일한다.
    const adminDongQueryName = dong.replace(/[,·ㆍ]/g, '.')
    const adminDongRes = await getAdminDong(district, adminDongQueryName)
    adminDong.value = adminDongRes.data

    // 2) admin_dong_id 기준으로 실제 DB에 저장된 리뷰 목록 조회
    const reviewsRes = await getReviews(adminDong.value.adminDongId)
    dongReviewList.value = reviewsRes.data.map(mapReviewResponse)
  } catch (error) {
    console.error('리뷰 정보를 불러오지 못했습니다:', error.response?.data || error)
    adminDong.value = null
    dongReviewList.value = []
    reviewsError.value =
      getErrorMessage(error, '리뷰 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
  } finally {
    reviewsLoading.value = false
  }
}

// 라우트로 선택된 구/동이 바뀔 때마다 실제 리뷰 목록을 다시 불러온다.
watch(
  [selectedDistrict, selectedDong],
  ([district, dong]) => {
    loadDongReviews(district, dong)
  },
  { immediate: true },
)

const dongAvgOverall = computed(() =>
  dongReviewList.value.length > 0
    ? dongReviewList.value.reduce((s, r) => s + r.overallRating, 0) / dongReviewList.value.length
    : 0,
)
// 관심 동네는 이제 실제 adminDongId로 서버에 저장되므로(동 이름 문자열이 아니라),
// admin_dong_id 조회가 끝나기 전에는 무엇을 저장할지 알 수 없다.
const isDongSaved = computed(() =>
  adminDong.value ? mypage.savedNeighborhoods.includes(adminDong.value.adminDongId) : false,
)

async function toggleSaveDong() {
  if (!adminDong.value) {
    saveToast.value =
      reviewsError.value || '동네 정보를 불러오는 중이에요. 잠시 후 다시 시도해주세요.'
    return
  }

  const willSave = !isDongSaved.value
  try {
    await mypage.toggleSavedNeighborhood(adminDong.value.adminDongId)
    if (willSave) saveToast.value = '관심 동네에 추가되었습니다.'
  } catch (error) {
    saveToast.value = '요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.'
  }
}

// 리뷰 작성 모달을 열기 전, 로그인 여부와 실제 admin_dong_id가 준비되었는지 확인한다.
const showLoginRequired = ref(false)

function openReviewForm() {
  if (!auth.isLoggedIn) {
    showLoginRequired.value = true
    return
  }

  if (!adminDong.value) {
    saveToast.value =
      reviewsError.value || '동네 정보를 불러오는 중이에요. 잠시 후 다시 시도해주세요.'
    return
  }
  showReviewForm.value = true
}

// ReviewWriteModal이 실제 DB 저장에 성공하면 응답을 그대로 받아 목록 맨 앞에 반영한다.
function handleReviewCreated(apiReview) {
  dongReviewList.value = [mapReviewResponse(apiReview), ...dongReviewList.value]
}

function goListings() {
  nbhd.listingsFrom = 'nbhd-info'
  router.push('/search/results')
}

const emptyStateItems = [
  '치안·CCTV·범죄율 현황',
  '교통 접근성 및 통근시간',
  '생활 인프라 (병원·편의점 등)',
  '실거주민 솔직 리뷰',
]

const DISTRICT_OFFSETS = {
  중구: { latOffset: 0.001, lngOffset: 0.001 },
}

// 형광 원색을 피한 웜·더스티 계열의 구별 색상
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

let dongPolygonMap = {}
let originalPolygonColors = {}
let complementaryPolygonColors = {}
let kakaoMapInstance = null
let districtBoundsMap = {}
let dongCenterMap = {}
let dongHoverOverlay = null
let dongHoverLabel = null
// 구 이름 라벨(CustomOverlay)도 폴리곤과 함께 정리 대상에 넣는다.
// (예전엔 이 목록이 없어서 언마운트/재초기화 시 라벨만 지도에 계속 남는 누수가 있었다)
let mapOverlayList = []
let districtOutlineList = []

// 서울에는 서로 다른 구에 같은 이름의 동(예: 강남구/관악구 신사동)이 있다.
// 지도 객체의 식별자는 화면에 보이는 동 이름만 쓰지 않고, 구 이름까지 포함해야
// 한 동의 호버/색상 변경이 다른 구의 동 경계에 적용되지 않는다.
function createDongKey(district, dongName) {
  const normalizedDong = String(dongName ?? '')
    .replace(/[\s,.·ㆍ]/g, '')
    .replace(/제(\d+동)$/, '$1')
  return `${district}:${normalizedDong}`
}

// initMap()이 다시 호출될 때마다(동 선택 해제로 전체 지도로 돌아올 때 등) 1씩 증가하는
// 세션 번호. 언마운트뿐 아니라 "같은 컴포넌트 안에서 재초기화"되는 경우까지 함께 잡아내어,
// 이전 세션에서 걸어둔 geojson fetch가 나중에 끝나도 최신 지도에 잘못 반영되지 않게 막는다.
let mapSession = 0
// SDK 로드가 끝나기 전에 컴포넌트가 사라진 경우를 막기 위한 최소한의 안전장치.
// (mapSession은 initMap 내부에서만 증가하므로, initMap 진입 전 단계는 이걸로 방어한다)
let disposed = false

// document.getElementById('map') 하드코딩 대신 template ref 사용
const mapContainer = ref(null)
const hoveredDongKey = ref(null)

watch(hoveredDongKey, (newKey, oldKey) => {
  if (oldKey && dongPolygonMap[oldKey]) {
    const originColor = originalPolygonColors[oldKey] || '#FF0000'
    dongPolygonMap[oldKey].setOptions({
      fillColor: originColor,
      fillOpacity: 0.65,
    })
  }
  if (newKey && dongPolygonMap[newKey]) {
    const compColor = complementaryPolygonColors[newKey] || '#00FFFF'
    dongPolygonMap[newKey].setOptions({
      fillColor: compColor,
      fillOpacity: 0.95,
    })
  }
})

onMounted(() => {
  // 지도 컴포넌트마다 각자 스크립트를 추가하면 중복 로드로 간헐적 실패가
  // 생길 수 있어, 앱 전체에서 공유하는 loadKakaoMap() 싱글턴을 사용한다.
  loadKakaoMap()
    .then(() => {
      if (disposed) return
      initMap()
    })
    .catch((err) => console.error('카카오맵 스크립트 로드 실패.', err))
})

watch(selectedDong, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      if (disposed) return
      initMap()
    })
  }
})

onBeforeUnmount(() => {
  disposed = true
  mapSession += 1
  clearMapObjects()
  kakaoMapInstance = null
})

// 폴리곤 + 구 라벨 오버레이 + 호버 상태를 한 번에 정리한다.
// onBeforeUnmount에서도, initMap() 재호출 시작 시점에도 동일하게 호출된다.
function clearMapObjects() {
  Object.values(dongPolygonMap).forEach((polygon) => polygon.setMap(null))
  mapOverlayList.forEach((overlay) => overlay.setMap(null))
  districtOutlineList.forEach((outline) => outline.setMap(null))

  dongPolygonMap = {}
  originalPolygonColors = {}
  complementaryPolygonColors = {}
  districtBoundsMap = {}
  dongCenterMap = {}
  dongHoverOverlay = null
  dongHoverLabel = null
  mapOverlayList = []
  districtOutlineList = []
  hoveredDongKey.value = null
}

function focusDistrict(districtName) {
  const bounds = districtBoundsMap[districtName]
  if (kakaoMapInstance && bounds && !bounds.isEmpty()) {
    kakaoMapInstance.setBounds(bounds)
  }
}

function resetMapView() {
  if (!kakaoMapInstance) return
  kakaoMapInstance.setCenter(new window.kakao.maps.LatLng(37.5665, 126.978))
  kakaoMapInstance.setLevel(9)
}

function toggleDistrict(districtName) {
  selectedDistrict.value = selectedDistrict.value === districtName ? null : districtName
}

function showDongHoverLabel(dongKey, dongName, position = dongCenterMap[dongKey]) {
  if (!dongHoverOverlay || !dongHoverLabel || !position) return
  dongHoverLabel.textContent = dongName
  dongHoverOverlay.setPosition(position)
  dongHoverOverlay.setMap(kakaoMapInstance)
}

function setHoveredDong(dongKey, dongName, position) {
  hoveredDongKey.value = dongKey
  showDongHoverLabel(dongKey, dongName, position)
}

function clearHoveredDong(dongKey) {
  if (hoveredDongKey.value !== dongKey) return
  hoveredDongKey.value = null
  dongHoverOverlay?.setMap(null)
}

watch(selectedDistrict, (districtName) => {
  if (districtName) focusDistrict(districtName)
  else resetMapView()
})

function initMap() {
  const container = mapContainer.value
  if (!container) return

  const currentSession = ++mapSession
  clearMapObjects()

  // 카카오맵 지도 레벨은 정수(1~14)만 지원한다. 소수점 레벨(8.45 등)을 넘기면
  // 타일 요청 URL(.../latest/8.45/46/22.png)이 존재하지 않는 경로가 되어
  // 타일 서버가 전부 400을 반환한다. 반드시 정수로만 넣는다.
  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(37.5665, 126.978),
    level: 9,
    disableDoubleClickZoom: true,
  })
  kakaoMapInstance = map

  map.setZoomable(false)
  map.setDraggable(false)

  // 카카오맵 이용약관상 로고/저작권 표기는 항상 노출되어야 하므로,
  // DOM에서 임의로 지우지 않고 공식 API로 위치만 조정한다.
  map.setCopyrightPosition(window.kakao.maps.CopyrightPosition.BOTTOMRIGHT, true)

  setTimeout(() => {
    if (currentSession !== mapSession) return
    map.relayout()
  }, 100)

  loadSeoulGeojson()
    .then((geojson) => {
      if (currentSession !== mapSession) return
      if (!geojson || !geojson.features) return

      const districtMap = {}
      const districtColorMap = {}
      const allDistricts = []
      const dongMapBuild = {}

      geojson.features.forEach((feature) => {
        const fullName = feature.properties.adm_nm || ''
        const nameParts = fullName.split(' ')
        const sigName = nameParts[1]
        const dongNameForList = nameParts[2]
        if (sigName && !allDistricts.includes(sigName)) {
          allDistricts.push(sigName)
        }
        if (sigName && dongNameForList) {
          if (!dongMapBuild[sigName]) dongMapBuild[sigName] = []
          if (!dongMapBuild[sigName].includes(dongNameForList)) {
            dongMapBuild[sigName].push(dongNameForList)
          }
        }
      })

      Object.keys(dongMapBuild).forEach((sigName) => {
        dongMapBuild[sigName].sort((a, b) => a.localeCompare(b, 'ko', { numeric: true }))
      })
      geojsonDongMap.value = dongMapBuild

      allDistricts.forEach((sigName, idx) => {
        const colorIdx = (idx * 4) % RAINBOW_25_COLORS.length
        districtColorMap[sigName] = RAINBOW_25_COLORS[colorIdx]
      })

      dongHoverLabel = document.createElement('div')
      dongHoverLabel.className = 'dong-hover-label'
      dongHoverOverlay = new window.kakao.maps.CustomOverlay({
        content: dongHoverLabel,
        xAnchor: 0.5,
        yAnchor: 1.2,
      })
      mapOverlayList.push(dongHoverOverlay)

      geojson.features.forEach((feature) => {
        const fullName = feature.properties.adm_nm || ''
        const nameParts = fullName.split(' ')
        const sigName = nameParts[1]
        const dongName = nameParts[2]

        if (!sigName || !dongName) return
        const dongKey = createDongKey(sigName, dongName)

        if (!districtMap[sigName]) {
          districtMap[sigName] = { totalLat: 0, totalLng: 0, pointCount: 0 }
        }
        if (!districtBoundsMap[sigName]) {
          districtBoundsMap[sigName] = new window.kakao.maps.LatLngBounds()
        }
        const districtBounds = districtBoundsMap[sigName]

        const coordinates = feature.geometry.coordinates
        const paths = []
        const dongCenter = { totalLat: 0, totalLng: 0, count: 0 }

        function processCoords(coordsArr) {
          const path = []
          coordsArr.forEach((coord) => {
            const lat = coord[1]
            const lng = coord[0]
            const latLng = new window.kakao.maps.LatLng(lat, lng)
            path.push(latLng)
            districtBounds.extend(latLng)
            dongCenter.totalLat += lat
            dongCenter.totalLng += lng
            dongCenter.count += 1
            districtMap[sigName].totalLat += lat
            districtMap[sigName].totalLng += lng
            districtMap[sigName].pointCount++
          })
          return path
        }

        if (feature.geometry.type === 'MultiPolygon') {
          coordinates.forEach((polygon) => {
            paths.push(processCoords(polygon[0]))
          })
        } else {
          paths.push(processCoords(coordinates[0]))
        }

        const assignedColor = districtColorMap[sigName] || '#FF0000'
        originalPolygonColors[dongKey] = assignedColor
        complementaryPolygonColors[dongKey] = getComplementaryColor(assignedColor)
        if (dongCenter.count > 0) {
          dongCenterMap[dongKey] = new window.kakao.maps.LatLng(
            dongCenter.totalLat / dongCenter.count,
            dongCenter.totalLng / dongCenter.count,
          )
        }

        const polygon = new window.kakao.maps.Polygon({
          path: paths,
          strokeWeight: 1,
          strokeColor: '#FFFDF8',
          strokeOpacity: 0.5,
          fillColor: assignedColor,
          fillOpacity: 0.65,
        })

        dongPolygonMap[dongKey] = polygon

        window.kakao.maps.event.addListener(polygon, 'mouseover', (mouseEvent) => {
          setHoveredDong(dongKey, dongName, mouseEvent.latLng)
        })
        window.kakao.maps.event.addListener(polygon, 'mousemove', (mouseEvent) => {
          showDongHoverLabel(dongKey, dongName, mouseEvent.latLng)
        })
        window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
          clearHoveredDong(dongKey)
        })
        window.kakao.maps.event.addListener(polygon, 'click', () => {
          if (selectedDistrict.value === sigName) selectDong(dongName)
        })

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
          outline.setMap(map)
          districtOutlineList.push(outline)
        })
      })

      Object.keys(districtMap).forEach((sigName) => {
        const dData = districtMap[sigName]
        if (dData.pointCount === 0) return

        let centerLat = dData.totalLat / dData.pointCount
        let centerLng = dData.totalLng / dData.pointCount

        if (DISTRICT_OFFSETS[sigName]) {
          centerLat += DISTRICT_OFFSETS[sigName].latOffset
          centerLng += DISTRICT_OFFSETS[sigName].lngOffset
        }

        const centerPos = new window.kakao.maps.LatLng(centerLat, centerLng)

        const contentDiv = document.createElement('div')
        contentDiv.className = 'dong-label clickable-label'
        contentDiv.innerText = sigName

        contentDiv.addEventListener('click', (e) => {
          e.stopPropagation()
          toggleDistrict(sigName)
        })

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: centerPos,
          content: contentDiv,
          xAnchor: 0.5,
          yAnchor: 0.5,
        })

        customOverlay.setMap(map)
        mapOverlayList.push(customOverlay)
      })

      if (selectedDistrict.value) focusDistrict(selectedDistrict.value)
    })
    .catch((err) => {
      if (currentSession !== mapSession) return
      console.error('GeoJSON 로드 오류:', err)
    })
}
</script>

<template>
  <!-- 동 상세 화면 -->
  <div v-if="selectedDong" class="min-h-screen bg-background pt-15">
    <ReviewWriteModal
      v-if="showReviewForm && adminDong"
      :admin-dong-id="adminDong.adminDongId"
      :admin-dong-name="`${adminDong.guName} ${adminDong.name}`"
      @close="showReviewForm = false"
      @created="handleReviewCreated"
    />
    <LoginRequiredModal
      v-if="showLoginRequired"
      message="로그인한 회원만 리뷰를 작성할 수 있어요."
      @close="showLoginRequired = false"
    />
    <BaseToast v-if="saveToast" :message="saveToast" @done="saveToast = null" />

    <div class="shrink-0 border-b border-border bg-white">
      <ExploreHeader
        :district="selectedDistrict"
        :dong="selectedDong"
        :population="dongStats?.stats?.population"
        :avg-overall="dongAvgOverall"
        :review-count="dongReviewList.length"
        :is-saved="isDongSaved"
        @back="backToDistrict"
        @toggle-save="toggleSaveDong"
        @listings="goListings"
        @write-review="openReviewForm"
      />
    </div>
    <ExploreTabs
      :district="selectedDistrict"
      :dong="selectedDong"
      :admin-dong-id="adminDong?.adminDongId"
      :reviews="dongReviewList"
      :stats="dongStats?.stats"
      :hash="dongStats?.hash"
      @write-review="openReviewForm"
      @listings="goListings"
    />

  </div>

  <!-- 구 선택 / 동 목록 화면 -->
  <div v-else class="flex h-screen pt-15 overflow-hidden">
    <!-- 좌측 카카오맵 영역 -->
    <div class="flex-1 relative overflow-hidden bg-background">
      <div ref="mapContainer" class="w-full h-full"></div>

      <div
        class="absolute top-4 right-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-border shadow-sm text-xs text-muted-foreground z-10"
      >
        구 이름을 클릭하거나 사이드바에서 동을 확인하세요
      </div>
    </div>

    <!-- 우측 사이드바 영역 -->
    <div class="w-100 shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
      <div
        v-if="!selectedDistrict"
        class="flex-1 flex flex-col items-center justify-center p-10 text-center"
      >
        <div
          class="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6 shadow-sm"
        >
          <Map :size="36" class="text-primary" />
        </div>
        <h2 class="text-xl font-bold text-foreground mb-3">궁금한 동네를 찾아보세요</h2>
        <p class="text-sm text-muted-foreground leading-relaxed mb-8">
          지도에서 구를 클릭하면 행정동 목록과<br />생활 정보, 실거주민 리뷰를 확인할 수 있어요.
        </p>
        <div class="w-full space-y-2.5">
          <div
            v-for="item in emptyStateItems"
            :key="item"
            class="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
          >
            <Check :size="14" class="text-primary shrink-0" /><span
            class="text-sm text-foreground"
          >{{ item }}</span
          >

          </div>
        </div>
      </div>

      <div v-else class="flex flex-col h-full overflow-hidden">
        <div class="p-5 border-b border-border shrink-0">
          <button
            @click="selectedDistrict = null"
            class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-3 font-medium"
          >
            <ChevronLeft :size="13" /> 전체 지도
          </button>
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-bold text-foreground">{{ selectedDistrict }}</h2>
              <div
                v-if="districtReviewSummary.count > 0"
                class="flex items-center gap-1.5 mt-1"
              >
                <StarDisplay :rating="districtReviewSummary.avg" :size="14" />
                <span class="text-sm font-bold text-foreground">{{ districtReviewSummary.avg.toFixed(1) }}</span>
                <span class="text-xs text-muted-foreground">({{ districtReviewSummary.count }}개 리뷰)</span>
              </div>
            </div>
            <span
              v-if="districtData"
              class="text-xs bg-secondary text-primary font-semibold px-3 py-1 rounded-full"
            >평균 월세 {{ districtData.avgRent }}만원</span

            >
          </div>
        </div>

        <template v-if="districtData">
          <div class="px-5 py-4 border-b border-border shrink-0">
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="item in [
                  { label: '치안', val: districtData.safetyScore, color: '#4A90D9' },
                  { label: '교통', val: districtData.transitScore, color: '#E07040' },
                  { label: '인프라', val: districtData.infraScore, color: '#52B37A' },
                ]"
                :key="item.label"
                class="bg-card border border-border rounded-xl p-3 text-center"
              >
                <p class="text-base font-bold" :style="{ color: item.color }">{{ item.val }}</p>
                <p class="text-xs text-muted-foreground">{{ item.label }}</p>
                <div class="w-full h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :style="{ width: item.val + '%', background: item.color }"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <div class="px-5 py-4">
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                행정동 목록
              </p>
              <div class="space-y-2">
                <button
                  v-for="dong in dongList"
                  :key="dong"
                  @click="selectDong(dong)"
                  @mouseenter="setHoveredDong(createDongKey(selectedDistrict, dong), dong)"
                  @mouseleave="clearHoveredDong(createDongKey(selectedDistrict, dong))"
                  class="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/40 hover:bg-secondary/50 transition-all text-left group"
                >
                  <div>
                    <div
                      class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors"
                    >
                      {{ dong }}
                    </div>
                    <div v-if="!dongReviewStatsLoading" class="flex items-center gap-1.5 mt-1">
                      <template v-if="dongReviewStats[dong]?.count > 0">
                        <StarDisplay :rating="dongReviewStats[dong].avg" :size="11" />
                        <span class="text-xs text-muted-foreground">
                          {{ dongReviewStats[dong].avg.toFixed(1) }} · {{ dongReviewStats[dong].count }}개
                        </span>
                      </template>
                      <span v-else class="text-xs text-muted-foreground">리뷰 없음</span>
                    </div>
                  </div>
                  <ChevronRight
                    :size="15"
                    class="text-muted-foreground group-hover:text-primary shrink-0"
                  />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.dong-label) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #cbd5e1;
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
  padding: 3px 7px;
  border-radius: 5px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.dong-label:hover) {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
  transform: scale(1.05);
}

:deep(.dong-hover-label) {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #cbd5e1;
  color: #1e293b;
  font-size: 15.6px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 7px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.16);
  pointer-events: none;
  white-space: nowrap;
}
</style>
