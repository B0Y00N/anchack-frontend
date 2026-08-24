<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Star } from 'lucide-vue-next'

const emit = defineEmits(['explore'])

const section = ref(null)
const isVisible = ref(false)
let observer = null

const reviews = [
  { dong: '성수동', text: '교통이 편하고 퇴근 후 갈 곳이 많아요.', side: 'left', initial: '성' },
  { dong: '망원동', text: '골목은 조용하지만 주말에는 사람이 붐벼요.', side: 'right', initial: '망' },
  { dong: '공덕동', text: '여러 노선이 지나 출퇴근이 정말 편해요.', side: 'left', initial: '공' },
  { dong: '용산구', text: '한강 산책로가 가까워 주말이 여유로워요.', side: 'right', initial: '용' },
  { dong: '연남동', text: '좋아하는 술집 덕에 일상이 복작여요.', side: 'left', initial: '연' },
  { dong: '마포구', text: '교통 편의 대비 집값이 합리적인 편이에요.', side: 'right', initial: '마' },
]

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = entry.isIntersecting
    },
    { threshold: 0.18 },
  )

  if (section.value) observer.observe(section.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section ref="section" class="review-voices overflow-hidden border-t border-border bg-white px-6 py-24 sm:px-8">
    <div class="mx-auto max-w-5xl">
      <div class="mx-auto mb-14 max-w-xl text-center">
        <p class="mb-3 text-xs font-bold tracking-[0.18em] text-primary">REAL VOICES</p>
        <h2 class="text-3xl font-bold text-foreground sm:text-4xl">실거주자의 이야기도 함께 살펴보세요</h2>
        <p class="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          데이터와 실제 거주 경험을 함께 확인하며 나에게 맞는 동네를 찾을 수 있어요.
        </p>
      </div>

      <div :class="['review-list', { 'is-visible': isVisible }]" aria-label="실거주민 동네 후기 예시">
        <article
          v-for="(review, index) in reviews"
          :key="review.dong"
          class="review-row"
          :style="{
            '--enter-delay': `${index * 115}ms`,
            '--leave-delay': `${(reviews.length - index - 1) * 75}ms`,
          }"
        >
          <div :class="['review-bubble-wrap', review.side]">
            <div v-if="review.side === 'left'" class="initial-badge">{{ review.initial }}</div>
            <div class="review-bubble">
              <div class="mb-1 flex items-center justify-between gap-4">
                <strong class="text-sm text-foreground">{{ review.dong }}</strong>
                <span class="flex items-center gap-0.5 text-primary" aria-label="별점 5점 만점">
                  <Star v-for="star in 5" :key="star" :size="12" fill="currentColor" aria-hidden="true" />
                </span>
              </div>
              <p class="text-sm leading-relaxed text-foreground/75">{{ review.text }}</p>
            </div>
            <div v-if="review.side === 'right'" class="initial-badge">{{ review.initial }}</div>
          </div>
        </article>
      </div>

      <div class="mt-12 text-center">
        <button
          type="button"
          class="rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          @click="emit('explore')"
        >
          더 많은 동네 이야기 보기
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.review-list {
  display: grid;
  gap: 1rem;
}

.review-row {
  display: flex;
}

.review-row:nth-child(even) {
  justify-content: flex-end;
}

.review-bubble-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: min(100%, 25rem);
  opacity: 0;
  transition:
    opacity 460ms ease var(--leave-delay),
    transform 460ms cubic-bezier(0.22, 1, 0.36, 1) var(--leave-delay);
}

.review-bubble-wrap.left {
  transform: translateX(-4.5rem);
}

.review-bubble-wrap.right {
  transform: translateX(4.5rem);
}

.is-visible .review-bubble-wrap {
  opacity: 1;
  transform: translateX(0);
  transition-delay: var(--enter-delay);
}

.initial-badge {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 9999px;
  background: #3d7a50;
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 3px 8px rgb(38 75 49 / 18%);
}

.review-bubble {
  flex: 1;
  border: 1px solid #cfe6d6;
  border-radius: 1.1rem;
  background: #f0f9f2;
  padding: 1rem 1.1rem;
  box-shadow: 0 3px 8px rgb(38 75 49 / 8%);
}

.right .review-bubble {
  border-color: #d6e0f4;
  background: #f2f6ff;
}

@media (max-width: 640px) {
  .review-row,
  .review-row:nth-child(even) {
    justify-content: flex-start;
  }

  .review-bubble-wrap {
    width: 100%;
  }

  .review-bubble-wrap.right {
    transform: translateX(3rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .review-bubble-wrap,
  .is-visible .review-bubble-wrap {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
