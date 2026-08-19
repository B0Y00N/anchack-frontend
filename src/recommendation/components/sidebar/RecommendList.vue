<script setup>
import { ref } from "vue";
import { AlertCircle, Check, BookOpen, RefreshCw, TrendingUp } from "lucide-vue-next";
import NeighborhoodCard from "./NeighborhoodCard.vue";
import { RELAXATION_HINTS } from "../../../common/utils/mockData";
import { useAuthStore } from "../../../user/stores/useAuthStore";

const authStore = useAuthStore();

const props = defineProps({
  neighborhoods: { type: Array, required: true },
  compareList: { type: Array, required: true },
  savedNeighborhoods: { type: Array, required: true },
  conditionSaved: { type: Boolean, default: false },
});
const emit = defineEmits(["detail", "compare", "toggle-save", "go-compare", "save-condition-click", "show-saved-list"]);

const activeFilter = ref("추천순");
const FILTERS = ["추천순", "통근시간순", "예산순", "치안 관련 시설"];
</script>

<template>
  <div class="w-[430px] flex-shrink-0 flex flex-col border-r border-border bg-background">
    <div class="px-6 pt-6 pb-4 border-b border-border">
      <div v-if="neighborhoods.length === 0" class="flex items-center gap-2 text-amber-600"><AlertCircle :size="18" /><h2 class="text-lg font-bold">검색 결과 0건</h2></div>
      <template v-else>
        <h2 class="text-xl font-bold text-foreground mb-1.5">{{ authStore.user?.nickname || "회원" }}님에게 잘 맞는 동네 {{ neighborhoods.length }}곳을 찾았어요</h2>
        <p class="text-sm text-muted-foreground">추천 이유와 아쉬운 점을 함께 비교해보세요.</p>
      </template>

      <div v-if="neighborhoods.length > 0" class="mt-3 flex items-center gap-2">
        <button v-if="!conditionSaved" @click="emit('save-condition-click')" class="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground border border-border px-3 py-1.5 rounded-full hover:bg-secondary hover:text-primary transition-colors">
          <Check :size="12" /> 이 조건 저장하기
        </button>
        <template v-else>
          <span class="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check :size="12" /> 저장 완료</span>
          <button @click="emit('show-saved-list')" class="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-secondary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
            <BookOpen :size="12" /> 저장된 조건 확인
          </button>
        </template>
      </div>
    </div>

    <div v-if="neighborhoods.length > 0" class="px-5 py-3 flex gap-2 overflow-x-auto border-b border-border [&::-webkit-scrollbar]:hidden">
      <button
        v-for="f in FILTERS"
        :key="f"
        @click="activeFilter = f"
        :class="`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 ${f === activeFilter ? 'bg-primary text-primary-foreground border-primary' : 'bg-white border-border hover:bg-secondary'}`"
      >
        {{ f === activeFilter ? "✓ " : "" }}{{ f }}
      </button>
    </div>

    <div v-if="compareList.length >= 2 && neighborhoods.length > 0" class="px-5 py-3 bg-secondary flex items-center justify-between border-b border-primary/15">
      <div class="flex items-center gap-2 min-w-0"><RefreshCw :size="13" class="text-primary flex-shrink-0" /><span class="text-sm font-medium text-primary truncate">{{ compareList.join(", ") }} 비교 중</span></div>
      <button @click="emit('go-compare')" class="ml-3 flex-shrink-0 text-xs font-bold text-primary bg-white px-3 py-1.5 rounded-full border border-primary/25 hover:bg-primary hover:text-white">비교 보기 →</button>
    </div>

    <div class="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div v-if="neighborhoods.length === 0" class="p-4">
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p class="text-sm font-semibold text-amber-800 mb-3">조건을 완화하면 동네를 찾을 수 있어요</p>
          <div class="space-y-3">
            <div v-for="(h, i) in RELAXATION_HINTS" :key="i" class="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
              <p class="text-xs text-foreground/80 flex-1">{{ h.condition }}</p>
              <span class="ml-3 flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">+{{ h.add }}곳</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-4 space-y-3">
        <NeighborhoodCard
          v-for="n in neighborhoods"
          :key="n.id"
          :n="n"
          :rank="n.rank"
          :compare-list="compareList"
          :is-saved="savedNeighborhoods.includes(n.id)"
          @detail="emit('detail', n.id)"
          @compare="emit('compare', n.id)"
          @toggle-save="emit('toggle-save', n.id)"
        />
        <div class="bg-card border border-border rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-3"><TrendingUp :size="15" class="text-primary" /><p class="text-sm font-semibold text-foreground">조건을 완화하면 더 많은 동네가 있어요</p></div>
          <div class="space-y-2">
            <div v-for="(h, i) in RELAXATION_HINTS" :key="i" class="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5">
              <p class="text-xs text-foreground/75">{{ h.condition }}</p>
              <span class="ml-2 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">+{{ h.add }}곳</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
