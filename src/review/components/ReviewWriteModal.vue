<script setup>
import { ref, computed } from "vue";
import { X, Check } from "lucide-vue-next";
import StarInput from "../../common/components/StarInput.vue";
import { REVIEW_CATEGORIES } from "../../common/utils/mockData";

const props = defineProps({
  district: { type: String, required: true },
  dong: { type: String, required: true },
});
const emit = defineEmits(["close", "submit"]);

const overallRating = ref(0);
const catRatings = ref({ 치안: 0, 교통: 0, 청결: 0, 분위기: 0, 소음: 0 });
const content = ref("");
const isAnonymous = ref(false);
const nickname = ref("");
const submitted = ref(false);

const canSubmit = computed(
  () =>
    overallRating.value > 0 &&
    content.value.length >= 20 &&
    Object.values(catRatings.value).every((v) => v > 0) &&
    (!isAnonymous.value || nickname.value.trim().length > 0),
);

function handleSubmit() {
  const author = isAnonymous.value ? nickname.value.trim() : "본인";
  emit("submit", {
    id: Date.now(),
    district: props.district,
    dong: props.dong,
    author,
    date: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").slice(0, -1),
    overallRating: overallRating.value,
    ratings: { ...catRatings.value },
    content: content.value,
  });
  submitted.value = true;
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click="emit('close')">
    <div class="bg-card w-full max-w-[560px] max-h-[88vh] overflow-y-auto rounded-2xl shadow-2xl border border-border" @click.stop>
      <div class="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h2 class="font-bold text-foreground text-lg">{{ dong }} 리뷰 작성</h2>
          <p class="text-xs text-muted-foreground">{{ district }} · 실제 거주 경험을 공유해주세요</p>
        </div>
        <button @click="emit('close')" class="p-1.5 rounded-lg hover:bg-muted"><X :size="18" class="text-muted-foreground" /></button>
      </div>

      <div v-if="submitted" class="p-12 text-center">
        <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4"><Check :size="28" class="text-primary" /></div>
        <h3 class="text-xl font-bold text-foreground mb-2">리뷰가 등록되었어요!</h3>
        <p class="text-sm text-muted-foreground mb-6">소중한 경험을 공유해 주셔서 감사해요.</p>
        <button @click="emit('close')" class="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-full hover:bg-primary/90">닫기</button>
      </div>

      <div v-else class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-semibold text-foreground mb-3">총 별점 <span class="text-red-500">*</span></label>
          <div class="flex items-center gap-3">
            <StarInput v-model="overallRating" :size="30" />
            <span class="text-xl font-bold text-foreground">{{ overallRating > 0 ? `${overallRating}.0` : "—" }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-foreground mb-3">항목별 별점 <span class="text-red-500">*</span></label>
          <div class="bg-muted/40 rounded-xl p-4 space-y-3">
            <div v-for="cat in REVIEW_CATEGORIES" :key="cat" class="flex items-center gap-4">
              <span class="text-sm font-medium text-foreground w-16 flex-shrink-0">{{ cat }}</span>
              <StarInput :model-value="catRatings[cat]" @update:model-value="(v) => (catRatings[cat] = v)" :size="20" />
              <span class="text-sm font-semibold w-6">{{ catRatings[cat] || "—" }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-foreground mb-2">
            내용 <span class="text-red-500">*</span> <span class="text-xs font-normal text-muted-foreground">(최소 20자)</span>
          </label>
          <textarea
            v-model="content"
            placeholder="이 동네에 살면서 느낀 점을 자유롭게 작성해주세요."
            rows="4"
            class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <p :class="`text-xs mt-1 text-right ${content.length < 20 ? 'text-muted-foreground' : 'text-primary'}`">{{ content.length }}자</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <label class="text-sm font-semibold text-foreground">익명으로 작성</label>
              <p class="text-xs text-muted-foreground mt-0.5">{{ isAnonymous ? "닉네임을 입력하면 해당 이름으로 게시돼요" : "본인 이름으로 게시돼요" }}</p>
            </div>
            <button
              type="button"
              @click="isAnonymous = !isAnonymous"
              :class="`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isAnonymous ? 'bg-primary' : 'bg-muted-foreground/30'}`"
            >
              <span :class="`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`" />
            </button>
          </div>
          <input
            v-if="isAnonymous"
            autofocus
            type="text"
            v-model="nickname"
            placeholder="닉네임을 입력하세요 (필수)"
            :class="`w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 ${nickname.trim() ? 'focus:ring-primary/30' : 'focus:ring-red-300'}`"
          />
        </div>

        <button :disabled="!canSubmit" @click="handleSubmit" class="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
          리뷰 등록하기
        </button>
        <p class="text-xs text-muted-foreground text-center">허위 정보 작성 시 제재를 받을 수 있어요.</p>
      </div>
    </div>
  </div>
</template>
