<script setup>
import { ref, computed } from 'vue'
import TabCommute from './TabCommute.vue'
import TabHousing from './TabHousing.vue'
import TabSafety from './TabSafety.vue'
import TabInfra from './TabInfra.vue'
import TabReview from '../../../review/components/TabReview.vue'

const props = defineProps({
  n: { type: Object, required: true },
  reviews: { type: Array, default: () => [] },
})
const emit = defineEmits(['listings', 'write-review'])

const TABS = ['통근', '치안', '생활 인프라', '주거비', '리뷰']
const tab = ref('통근')

const hash = computed(() => props.n.dongName.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 20)
const avgOverall = computed(() =>
  props.reviews.length > 0
    ? props.reviews.reduce((sum, review) => sum + review.overallRating, 0) / props.reviews.length
    : 0,
)
const catAvgs = computed(() => {
  const categories = ['소음', '청결', '치안', '분위기', '교통']
  return categories.map((cat) => ({
    cat,
    avg:
      props.reviews.length > 0
        ? props.reviews.reduce((sum, review) => sum + (review.ratings[cat] || 0), 0) /
          props.reviews.length
        : 0,
  }))
})
</script>

<template>
  <div>
    <div class="flex border-b border-border mb-8">
      <button
        v-for="t in TABS"
        :key="t"
        @click="tab = t"
        :class="`px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors duration-200 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`"
      >
        {{ t === '리뷰' ? `리뷰${reviews.length > 0 ? ` ${reviews.length}` : ''}` : t }}
      </button>
    </div>

    <transition name="tab-fade" mode="out-in">
      <TabCommute v-if="tab === '통근'" key="통근" :n="n" :hash="hash" />
      <TabHousing v-else-if="tab === '주거비'" key="주거비" :n="n" @listings="emit('listings')" />
      <TabSafety v-else-if="tab === '치안'" key="치안" :n="n" :hash="hash" />
      <TabInfra v-else-if="tab === '생활 인프라'" key="생활 인프라" :n="n" :hash="hash" />
      <TabReview
        v-else-if="tab === '리뷰'"
        key="리뷰"
        :reviews="reviews"
        :avg-overall="avgOverall"
        :cat-avgs="catAvgs"
        @write-review="emit('write-review')"
      />
    </transition>
  </div>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
