<script setup>
import { inject, useSlots, onMounted, onUpdated } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({ class: { type: String, default: "" } });
const carousel = inject("carousel", null);
const slots = useSlots();

function syncCount() {
  const children = slots.default?.() ?? [];
  carousel.itemCount.value = children.length;
}
onMounted(syncCount);
onUpdated(syncCount);
</script>

<template>
  <div class="overflow-hidden">
    <div
      data-slot="carousel-content"
      :class="cn(
        'flex transition-transform duration-300',
        carousel?.orientation === 'vertical' ? 'flex-col' : '-ml-4',
        props.class,
      )"
      :style="{
        transform: carousel?.orientation === 'vertical'
          ? `translateY(-${carousel.currentIndex.value * 100}%)`
          : `translateX(-${carousel.currentIndex.value * 100}%)`,
      }"
    >
      <slot />
    </div>
  </div>
</template>
