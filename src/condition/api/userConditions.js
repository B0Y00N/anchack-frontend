import api from "../../common/api/axios";

// POST /api/user-conditions: 조건 저장 + 추천 계산을 한 번에 처리한다 (API_USER_CONDITIONS.md 참고).
// 추천 이유 생성에 OpenAI 프록시를 거쳐 최대 16초까지 걸릴 수 있어, 공용 axios 인스턴스의
// 기본 10초 타임아웃(common/api/axios.js)보다 여유를 둔다.
export const submitUserConditions = (payload) => api.post("/user-conditions", payload, { timeout: 20000 });
