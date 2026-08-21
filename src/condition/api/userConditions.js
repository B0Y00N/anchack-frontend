import api from "../../common/api/axios";

// POST /api/user-conditions: 조건 저장 + 추천 계산을 한 번에 처리한다 (API_USER_CONDITIONS.md 참고).
// 추천 이유 생성에 OpenAI 프록시를 거쳐 최대 16초까지 걸릴 수 있어, 공용 axios 인스턴스의
// 기본 10초 타임아웃(common/api/axios.js)보다 여유를 둔다.
export const submitUserConditions = (payload) => api.post("/user-conditions", payload, { timeout: 20000 });

// 조건을 "저장"으로 표시한다(is_saved=true, title도 같이 저장). 멱등 - 이미 저장돼
// 있어도 그대로 성공. 본인 소유 아니면 403, 없으면 404.
export const saveUserCondition = (conditionId, title) => api.put(`/user-conditions/${conditionId}/save`, { title });

// 로그인 사용자가 저장(is_saved=true)한 조건 목록을 최신순으로 반환.
export const getSavedUserConditions = () => api.get("/user-conditions/saved");

// 조건을 "저장 안 함"으로 되돌린다(is_saved=false). save API와 같은 URL, DELETE만 다름.
export const deleteSavedCondition = (conditionId) => api.delete(`/user-conditions/${conditionId}/save`);

// 저장된 조건으로 새로 검색을 돌리지 않고, 그때 계산해둔 추천 결과를 그대로 다시 받아온다.
// 응답의 recommendations 항목 구성(adminDongId/guName/dongName/lat/lng/totalScore/
// dataCoverageRate/rank/commuteTime/transferCount/route/transportType/lineNum/
// vehicleType/walkMin/transitMin/recommendationReason/caution)이 POST /user-conditions의
// recommendations[]와 동일해서, SearchResultView.vue가 그대로 재사용할 수 있다.
export const getConditionRecommendations = (conditionId) => api.get(`/user-conditions/${conditionId}/recommendations`);

// 저장된 조건이 latest=false(admin_dong 지표 등이 갱신돼 결과가 최신이 아닐 수 있음)일 때
// 그 조건으로 추천을 다시 계산한다. 응답이 POST /user-conditions와 동일하게
// { conditionId, recommendations } 형태라 useRecommendationStore.recompute()가 submit()과
// 같은 방식으로 처리한다. 재계산도 OpenAI 이유 생성을 다시 거칠 수 있어 동일하게 20초 타임아웃.
export const recomputeUserCondition = (conditionId) =>
  api.post(`/user-conditions/${conditionId}/recompute`, null, { timeout: 20000 });
