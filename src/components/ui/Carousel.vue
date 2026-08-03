<script setup>
// 참고: embla-carousel-react는 React 전용이라, 여기서는 index 기반의 간단한 캐러셀로 재구현했습니다.
// 드래그/스와이프, 루프, 다중 플러그인 등 embla의 고급 기능은 포함되어 있지 않습니다.
import { ref, provide, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  orientation: { type: String, default: "horizontal" }, // "horizontal" | "vertical"
});

const currentIndex = ref(0);
const itemCount = ref(0);

const canScrollPrev = computed(() => currentIndex.value > 0);
const canScrollNext = computed(() => currentIndex.value < itemCount.value - 1);

function scrollPrev() {
  if (canScrollPrev.value) currentIndex.value -= 1;
}
function scrollNext() {
  if (canScrollNext.value) currentIndex.value += 1;
}

provide("carousel", {
  orientation: props.orientation,
  currentIndex,
  itemCount,
  scrollPrev,
  scrollNext,
  canScrollPrev,
  canScrollNext,
});

function onKeydown(e) {
  if (e.key === "ArrowLeft") { e.preventDefault(); scrollPrev(); }
  else if (e.key === "ArrowRight") { e.preventDefault(); scrollNext(); }
}
</script>

<template>
  <div data-slot="carousel" :class="cn('relative', props.class)" role="region" aria-roledescription="carousel" @keydown="onKeydown" tabindex="0">
    <slot />
  </div>
</template>
