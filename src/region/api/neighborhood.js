import api from "../../common/api/axios";

export const getNeighborhoodDetail = (id) =>
  api.get(`/neighborhoods/${id}`);

export const compareNeighborhoods = (ids) =>
  api.post("/neighborhoods/compare", { ids });

/*
 * 화면에서 다루는 "구 이름 + 행정동 이름" 문자열을
 * 실제 DB의 admin_dong_id로 변환한다.
 *
 * 리뷰 작성/조회 등 admin_dong_id가 필요한 기능에서 사용한다.
 */
export const getAdminDong = (guName, dongName) =>
  api.get("/admin-dongs", {
    params: {
      guName,
      dongName,
    },
  });

/*
 * 행정동 상세 정보(월세 시세, 치안, 생활 인프라 개수 등)를 id 배열로 한 번에 조회한다.
 * 추천 결과(최대 5개)를 한 번의 배치 호출로 채우는 용도 (P1-b, API_USER_CONDITIONS_REVISION_REQUEST.md 참고)
 */
export const getAdminDongsBatch = (ids) =>
  api.get("/admin-dongs/batch", {
    params: { ids: ids.join(",") },
  });

/*
 * 특정 구에 속한 모든 행정동의 리뷰 개수/평균 별점을 한 번에 조회한다.
 * (동네 둘러보기 - 구 선택 시 동 목록에 리뷰 요약을 보여주는 용도)
 * 백엔드 GET /api/admin-dongs/review-stats?guName=... 참고.
 */
export const getReviewStatsByGu = (guName) =>
  api.get("/admin-dongs/review-stats", {
    params: { guName },
  });

/*
 * 행정동 안의 실제 장소(places 테이블) 좌표를 조회한다. categories를 생략하면 전체
 * 카테고리를 반환한다 (P2, API_USER_CONDITIONS_REVISION_REQUEST.md 참고).
 * NeighborhoodMap.vue가 상세 탭(통근/치안/생활 인프라) 지도 마커를 그리는 데 쓴다.
 */
export const getAdminDongPlaces = (adminDongId) =>
  api.get(`/admin-dongs/${adminDongId}/places`);
