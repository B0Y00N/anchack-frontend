<script setup>
import { MessageSquare } from "lucide-vue-next";
import StarDisplay from "../../common/components/StarDisplay.vue";
import ReviewCard from "./ReviewCard.vue";

defineProps({
  reviews: { type: Array, required: true },
  avgOverall: { type: Number, default: 0 },
  catAvgs: { type: Array, required: true }, // [{ cat, avg }]
});
const emit = defineEmits(["write-review"]);
</script>

<template>
  <div class="space-y-5">
    <div class="bg-card border border-border rounded-2xl p-6">
      <div class="flex items-stretch gap-8">
        <div class="text-center flex-shrink-0 flex flex-col items-center justify-center pr-8 border-r border-border">
          <p class="text-5xl font-bold text-foreground mb-2">{{ reviews.length > 0 ? avgOverall.toFixed(1) : "—" }}</p>
          <StarDisplay :rating="avgOverall" :size="20" />
          <p class="text-xs text-muted-foreground mt-2">{{ reviews.length }}개 리뷰</p>
        </div>
        <div class="flex-1 space-y-2.5">
          <div v-for="{ cat, avg } in catAvgs" :key="cat" class="flex items-center gap-3">
            <span class="text-xs text-muted-foreground w-14 flex-shrink-0">{{ cat }}</span>
            <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div class="h-full rounded-full" :style="{ width: (avg / 5) * 100 + '%', background: '#2D7A4F' }" />
            </div>
            <span class="text-xs font-semibold text-foreground w-8 text-right">{{ avg > 0 ? avg.toFixed(1) : "—" }}</span>
          </div>
        </div>
      </div>
    </div>

    <button @click="emit('write-review')" class="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/30 rounded-2xl py-5 text-primary font-semibold hover:bg-secondary transition-colors text-sm">
      <MessageSquare :size="16" /> 이 동네 리뷰 직접 작성하기
    </button>

    <div v-if="reviews.length === 0" class="text-center py-16 bg-card border border-border rounded-2xl">
      <div class="text-4xl mb-4">✍️</div>
      <p class="font-semibold text-foreground mb-1">아직 작성된 리뷰가 없어요</p>
      <p class="text-sm text-muted-foreground">이 동네에 살고 계신다면 첫 리뷰를 남겨주세요!</p>
    </div>
    <div v-else class="space-y-4">
      <ReviewCard v-for="r in reviews" :key="r.id" :review="r" />
    </div>
  </div>
</template>
