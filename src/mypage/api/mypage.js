import api from "./axios";

export const getSavedNeighborhoods = () => api.get("/mypage/neighborhoods");
export const getSavedConditions = () => api.get("/mypage/conditions");
export const getMyReviews = () => api.get("/mypage/reviews");
