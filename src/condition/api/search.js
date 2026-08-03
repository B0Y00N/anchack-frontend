import api from "../../common/api/axios";

export const submitSearchConditions = (appState) => api.post("/search", appState);
export const getRecommendations = (searchId) => api.get(`/search/${searchId}/recommendations`);
