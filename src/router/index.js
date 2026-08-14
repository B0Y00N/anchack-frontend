import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "home", component: () => import("../home/views/HomeView.vue") },
  { path: "/login", name: "login", component: () => import("../user/views/AuthView.vue") },
  { path: "/signup", name: "signup", component: () => import("../user/views/AuthView.vue") },
  { path: "/oauth/callback/kakao", name: "kakao-callback", component: () => import("../user/views/KakaoCallback.vue") },

  { path: "/search/step/:step", name: "search-step", component: () => import("../condition/views/SearchInputView.vue"), meta: { requiresAuth: true } },
  { path: "/search/loading", name: "search-loading", component: () => import("../condition/views/SearchInputView.vue"), meta: { requiresAuth: true } },
  { path: "/search/results", name: "search-results", component: () => import("../recommendation/views/SearchResultView.vue"), meta: { requiresAuth: true } },
  { path: "/search/results/:id", name: "search-detail", component: () => import("../recommendation/views/SearchResultView.vue"), meta: { requiresAuth: true } },
  { path: "/search/results/:id/listings", name: "search-listings", component: () => import("../recommendation/views/SearchResultView.vue"), meta: { requiresAuth: true } },
  { path: "/search/compare", name: "search-compare", component: () => import("../recommendation/views/SearchResultView.vue"), meta: { requiresAuth: true } },

  { path: "/explore", name: "explore", component: () => import("../region/views/ExploreView.vue") },
  { path: "/explore/:district", name: "explore-district", component: () => import("../region/views/ExploreView.vue") },
  { path: "/explore/:district/:dong", name: "explore-dong", component: () => import("../region/views/ExploreView.vue") },

  { path: "/mypage", name: "mypage", component: () => import("../mypage/views/MyPageView.vue"), meta: { requiresAuth: true } },
  { path: "/mypage/favorites", name: "mypage-favorites", component: () => import("../mypage/views/MyPageView.vue"), meta: { requiresAuth: true } },

  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const accessToken = localStorage.getItem("accessToken");
  const guestOnlyPages = ["/login", "/signup"];

  if (accessToken && guestOnlyPages.includes(to.path)) {
    alert("이미 로그인한 사용자입니다.");
    return { path: "/", replace: true };
  }

  if (!accessToken && to.meta?.requiresAuth) {
    alert("로그인이 필요한 기능입니다.");
    return { path: "/login", query: { redirect: to.fullPath }, replace: true };
  }

  return true;
});

export default router;
