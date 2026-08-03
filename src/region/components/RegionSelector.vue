<script setup>
import { ref } from "vue";
import { SEOUL_DISTRICTS, EXPLORE_COLORS } from "../../../utils/mockData";

const props = defineProps({
  modelValue: { type: String, default: null }, // 선택된 구
});
const emit = defineEmits(["update:modelValue"]);

const hovered = ref(null);

function select(id) {
  emit("update:modelValue", id);
}
</script>

<template>
  <div class="relative w-full h-full flex items-center justify-center p-6">
    <div v-if="hovered" class="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-foreground/90 text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none shadow-lg">
      {{ hovered }} {{ modelValue === hovered ? "✓ 선택됨" : "— 클릭하여 선택" }}
    </div>
    <svg viewBox="0 0 600 525" class="w-full h-full" style="max-height: 100%">
      <path d="M 34,310 Q 150,295 250,308 Q 360,318 480,295 Q 540,285 590,290" fill="none" stroke="#A8D4E6" stroke-width="20" stroke-linecap="round" opacity="0.75" />
      <path d="M 34,310 Q 150,295 250,308 Q 360,318 480,295 Q 540,285 590,290" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.4" />
      <text x="390" y="284" font-size="10" fill="#5A9AB8" font-family="Noto Sans KR,sans-serif" font-weight="700">한강</text>
      <g v-for="d in SEOUL_DISTRICTS" :key="d.id" style="cursor: pointer" @click="select(d.id)">
        <polygon
          :points="d.pts"
          :fill="modelValue === d.id ? '#2D7A4F' : EXPLORE_COLORS[d.id] || '#B8D0B0'"
          :fill-opacity="modelValue === d.id ? 0.95 : hovered === d.id ? 0.95 : 0.82"
          stroke="white"
          stroke-width="1.8"
          style="transition: fill 0.12s, fill-opacity 0.12s"
          @mouseenter="hovered = d.id"
          @mouseleave="hovered = null"
        />
        <text
          :x="d.cx"
          :y="d.cy + 4"
          text-anchor="middle"
          :font-size="modelValue === d.id ? 11 : 9.5"
          :font-weight="modelValue === d.id ? '700' : '600'"
          :fill="modelValue === d.id ? 'white' : '#1A2C21'"
          font-family="Noto Sans KR,sans-serif"
          style="pointer-events: none; user-select: none"
        >
          {{ d.id.replace("구", "") }}
        </text>
      </g>
    </svg>
  </div>
</template>
