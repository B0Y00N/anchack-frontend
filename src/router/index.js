import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "home", component: () => import("../views/HomeView.vue") },
  { path: "/login", name: "login", component: () => import("../views/AuthView.vue") },
  { path: "/signup", name: "signup", component: () => import("../views/AuthView.vue") },

  { path: "/search/step/:step", name: "search-step", component: () => import("../views/SearchInputView.vue") },
  { path: "/search/loading", name: "search-loading", component: () => import("../views/SearchInputView.vue") },
  { path: "/search/results", name: "search-results", component: () => import("../views/SearchResultView.vue") },
  { path: "/search/results/:id", name: "search-detail", component: () => import("../views/SearchResultView.vue") },
  { path: "/search/results/:id/listings", name: "search-listings", component: () => import("../views/SearchResultView.vue") },
  { path: "/search/compare", name: "search-compare", component: () => import("../views/SearchResultView.vue") },

  { path: "/explore", name: "explore", component: () => import("../views/ExploreView.vue") },
  { path: "/explore/:district", name: "explore-district", component: () => import("../views/ExploreView.vue") },
  { path: "/explore/:district/:dong", name: "explore-dong", component: () => import("../views/ExploreView.vue") },

  { path: "/mypage", name: "mypage", component: () => import("../views/MyPageView.vue") },
  { path: "/mypage/favorites", name: "mypage-favorites", component: () => import("../views/MyPageView.vue") },

  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
  ],
})

export default router
