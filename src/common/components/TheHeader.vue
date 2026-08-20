<script setup>
import { watch } from "vue";
import { useRouter } from "vue-router";
import { User, LogOut, Search, ShoppingCart } from "lucide-vue-next";
import SproutLogo from "./SproutLogo.vue";
import { useAuthStore } from "../../user/stores/useAuthStore";
import { useNeighborhoodStore } from "../../region/stores/useNeighborhoodStore";
import { useMyPageStore } from "../../mypage/stores/useMyPageStore";

const router = useRouter();
const auth = useAuthStore();
const nbhd = useNeighborhoodStore();
const mypage = useMyPageStore();

// 로그인 확인(router 가드의 loadUser)이 언제 끝날지 몰라서, 헤더가 항상 떠 있다는
// 점을 이용해 로그인 상태가 true가 되는 시점에 관심 동네 목록을 한 번 받아온다.
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) mypage.fetchSavedNeighborhoods();
  },
  { immediate: true },
);

function navigate(path) {
  router.push(path);
}
function logout() {
  auth.logout();
  mypage.resetSavedNeighborhoods();
  router.push("/");
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border h-[60px] flex items-center px-8">
    <button @click="navigate('/')" class="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity mr-auto">
      <SproutLogo :size="32" />
      <div class="text-left leading-none">
        <div class="font-bold text-foreground text-left" style="font-size: 15px">안착</div>
        <div class="text-muted-foreground text-left mt-0.5" style="font-size: 10px">낯선 동네에서의 안전한 정착</div>
      </div>
    </button>

    <nav v-if="auth.isLoggedIn" class="flex items-center gap-2">
      <button @click="navigate('/mypage')" class="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-secondary">
        <User :size="15" /> 마이페이지
      </button>
      <button @click="navigate('/mypage/favorites')" class="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-secondary">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0">
          <path d="M8 2L2 7V14H6V10H10V14H14V7L8 2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none" />
          <path d="M8 12.5C8 12.5 5.5 11 5.5 9.3C5.5 8.4 6.2 7.7 7 7.7C7.4 7.7 7.8 7.9 8 8.2C8.2 7.9 8.6 7.7 9 7.7C9.8 7.7 10.5 8.4 10.5 9.3C10.5 11 8 12.5 8 12.5Z" fill="currentColor" stroke="none" />
        </svg>
        관심 동네
        <span v-if="mypage.savedNeighborhoods.length > 0" class="min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">{{ mypage.savedNeighborhoods.length }}</span>
      </button>
      <button @click="navigate('/search/compare')" aria-label="비교 목록" class="relative flex items-center justify-center text-foreground/70 hover:text-primary transition-colors p-2 rounded-lg hover:bg-secondary">
        <ShoppingCart :size="18" />
        <span v-if="nbhd.compareList.length > 0" class="absolute -right-0.5 -top-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{{ nbhd.compareList.length }}</span>
      </button>
      <button @click="logout" class="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted">
        <LogOut :size="15" /> 로그아웃
      </button>
      <button @click="navigate('/search/step/1')" class="ml-2 flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm">
        <Search :size="14" /> 동네 찾기
      </button>
    </nav>

    <nav v-else class="flex items-center gap-2">
      <button @click="navigate('/login')" class="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted">로그인</button>
      <button @click="navigate('/signup')" class="text-sm font-semibold text-primary border border-primary/40 px-4 py-2 rounded-full hover:bg-secondary transition-colors">회원가입</button>
      <button @click="navigate('/search/step/1')" class="ml-2 flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm">
        <Search :size="14" /> 동네 찾기
      </button>
    </nav>
  </header>
</template>
