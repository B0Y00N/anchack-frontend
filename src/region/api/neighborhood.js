import api from "../../common/api/axios";

export const getNeighborhoodDetail = (id) => api.get(`/neighborhoods/${id}`);
export const compareNeighborhoods = (ids) => api.post("/neighborhoods/compare", { ids });
