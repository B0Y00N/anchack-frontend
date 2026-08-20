import { ref } from 'vue'

// ResultMap.vue / NeighborhoodMap.vue / DistrictMap.vue가 각자 isLoading·loadError
// ref를 따로 선언하던 걸 하나로 뽑았다. SDK나 geojson 로딩이 끝나면 markLoaded(),
// 실패하면 markError()를 호출하면 된다. 언마운트 이후 호출 방지는 각 컴포넌트의
// disposed 플래그로 계속 감싸서 쓴다 (이 컴포저블 자체는 그 판단을 하지 않는다).
export function useMapLoadState() {
  const isLoading = ref(true)
  const loadError = ref(false)

  function markLoaded() {
    isLoading.value = false
    loadError.value = false
  }

  function markError() {
    isLoading.value = false
    loadError.value = true
  }

  return { isLoading, loadError, markLoaded, markError }
}
