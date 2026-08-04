import api from "../../common/api/axios";

export const getReviews = (district, dong) => api.get("/reviews", { params: { district, dong } });
export const createReview = (payload) => api.post("/reviews", payload);
export const updateReview = (id, payload) => api.put(`/reviews/${id}`, payload);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
