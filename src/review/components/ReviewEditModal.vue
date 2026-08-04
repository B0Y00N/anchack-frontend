<script setup>
import { ref, computed } from "vue";
import { X } from "lucide-vue-next";
import StarInput from "../../common/components/StarInput.vue";
import { REVIEW_CATEGORIES } from "../../common/utils/mockData";

const props = defineProps({
  review: { type: Object, required: true },
});
const emit = defineEmits(["close", "save"]);

const overallRating = ref(props.review.overallRating);
const catRatings = ref({ ...props.review.ratings });
const content = ref(props.review.content);
const canSave = computed(() => overallRating.value > 0 && content.value.length >= 20);

function save() {
  emit("save", { ...props.review, overallRating: overallRating.value, ratings: catRatings.value, content: content.value });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click="emit('close')">
    <div class="bg-card w-full max-w-[520px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl border border-border" @click.stop>
      <div class="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h2 class="font-bold text-foreground text-lg">리뷰 수정</h2>
          <p class="text-xs text-muted-foreground">{{ review.district }} {{ review.dong }}</p>
        </div>
        <button @click="emit('close')" class="p-1.5 rounded-lg hover:bg-muted">
          <X :size="18" class="text-muted-foreground" />
        </button>
      </div>
      <div class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-semibold text-foreground mb-3">총 별점 <span class="text-red-500">*</span></label>
          <div class="flex items-center gap-3">
            <StarInput v-model="overallRating" :size="30" />
            <span class="text-xl font-bold text-foreground">{{ overallRating > 0 ? `${overallRating}.0` : "—" }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-foreground mb-3">항목별 별점</label>
          <div class="bg-muted/40 rounded-xl p-4 space-y-3">
            <div v-for="cat in REVIEW_CATEGORIES" :key="cat" class="flex items-center gap-4">
              <span class="text-sm font-medium text-foreground w-16 flex-shrink-0">{{ cat }}</span>
              <StarInput :model-value="catRatings[cat] ?? 0" @update:model-value="(v) => (catRatings[cat] = v)" :size="20" />
              <span class="text-sm font-semibold w-6">{{ catRatings[cat] || "—" }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-foreground mb-2">내용 <span class="text-red-500">*</span></label>
          <textarea v-model="content" rows="4" class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          <p :class="`text-xs mt-1 text-right ${content.length < 20 ? 'text-muted-foreground' : 'text-primary'}`">{{ content.length }}자</p>
        </div>

        <button
          :disabled="!canSave"
          @click="save"
          class="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          수정 완료
        </button>
      </div>
    </div>
  </div>
</template>
