import api from "../../common/api/axios";

export const getSavedNeighborhoods = () => api.get("/mypage/neighborhoods");
export const getSavedConditions = () => api.get("/mypage/conditions");
export const getMyReviews = () => api.get("/mypage/reviews");

// 관심 동네 추가/삭제. 둘 다 백엔드에서 멱등하게 처리하므로(두 번 눌러도 에러 없음)
// 프론트에서 별도로 중복 클릭을 막을 필요는 없다.
export const addFavoriteDong = (adminDongId) => api.post("/favorite-dongs", { adminDongId });
export const removeFavoriteDong = (adminDongId) => api.delete(`/favorite-dongs/${adminDongId}`);
// [{ adminDongId, createdAt }] 배열, createdAt DESC(최근 등록순). 비로그인 401.
export const getFavoriteDongs = () => api.get("/favorite-dongs");
