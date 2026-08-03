<script setup>
import { ref, computed } from "vue";
import { X } from "lucide-vue-next";
import { SEOUL_DISTRICTS, LANDMARKS } from "../../common/utils/mockData";

const props = defineProps({
  modelValue: { type: Array, required: true }, // 선택된 구 이름 배열
  max: { type: Number, default: 2 },
});
const emit = defineEmits(["update:modelValue"]);

const hovered = ref(null);

function isSelected(id) {
  return props.modelValue.includes(id);
}
function toggle(id) {
  if (isSelected(id)) emit("update:modelValue", props.modelValue.filter((x) => x !== id));
  else if (props.modelValue.length < props.max) emit("update:modelValue", [...props.modelValue, id]);
}

function districtColor(d) {
  const isSel = isSelected(d.id);
  const isHov = hovered.value === d.id;
  return isSel ? "#2D7A4F" : isHov ? "#8ECBA9" : "#C8DEC8";
}
function districtOpacity(d) {
  const isSel = isSelected(d.id);
  const isHov = hovered.value === d.id;
  const isDisabled = !isSel && props.modelValue.length >= props.max;
  return isSel ? 0.92 : isHov ? 0.85 : isDisabled ? 0.35 : 0.65;
}
function isDisabled(id) {
  return !isSelected(id) && props.modelValue.length >= props.max;
}
function landmarkLabelWidth(name) {
  return name.length * 5.4 + 8;
}
</script>

<template>
  <div class="relative w-full">
    <div v-if="hovered" class="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-foreground text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none shadow-lg">
      {{ hovered }} {{ isSelected(hovered) ? "✓" : modelValue.length >= max ? "(최대)" : "— 선택" }}
    </div>

    <svg viewBox="0 0 600 525" class="w-full" style="max-height: 360px">
      <path d="M 34,310 Q 150,295 250,308 Q 360,318 480,295 Q 540,285 590,290" fill="none" stroke="#A8D4E6" stroke-width="18" stroke-linecap="round" opacity="0.6" />
      <text x="420" y="290" font-size="9" fill="#6BA3BC" font-family="Noto Sans KR,sans-serif" font-weight="600">한강</text>

      <g v-for="d in SEOUL_DISTRICTS" :key="d.id" :style="{ cursor: isDisabled(d.id) ? 'not-allowed' : 'pointer' }">
        <polygon
          :points="d.pts"
          :fill="districtColor(d)"
          :fill-opacity="districtOpacity(d)"
          stroke="white"
          stroke-width="1.5"
          @mouseenter="hovered = d.id"
          @mouseleave="hovered = null"
          @click="!isDisabled(d.id) && toggle(d.id)"
        />
        <text
          :x="d.cx"
          :y="d.cy + 4"
          text-anchor="middle"
          :font-size="isSelected(d.id) ? 10 : 9"
          :font-weight="isSelected(d.id) ? '700' : '500'"
          :fill="isSelected(d.id) ? 'white' : isDisabled(d.id) ? '#9ABFA6' : '#1A2C21'"
          font-family="Noto Sans KR,sans-serif"
          style="pointer-events: none; user-select: none"
        >
          {{ d.id.replace("구", "") }}
        </text>
      </g>

      <g v-for="(lm, i) in LANDMARKS" :key="i" style="pointer-events: none; user-select: none">
        <path
          d="M0,-11 C-5,-11 -7,-7 -7,-4 C-7,1 0,7 0,7 C0,7 7,1 7,-4 C7,-7 5,-11 0,-11 Z"
          :transform="`translate(${lm.x},${lm.y - 1})`"
          :fill="isSelected(lm.district) ? '#ffffff' : isDisabled(lm.district) ? 'rgba(160,190,165,0.45)' : '#2D7A4F'"
          :stroke="isSelected(lm.district) ? 'rgba(255,255,255,0.4)' : isDisabled(lm.district) ? 'transparent' : '#1A4A28'"
          stroke-width="0.8"
        />
        <circle :cx="lm.x" :cy="lm.y - 5" r="2.5" :fill="isSelected(lm.district) ? 'rgba(45,122,79,0.7)' : isDisabled(lm.district) ? 'transparent' : 'rgba(255,255,255,0.85)'" />
        <rect :x="lm.x + 9" :y="lm.y - 14" :width="landmarkLabelWidth(lm.name)" height="11" rx="3.5" :fill="isSelected(lm.district) ? 'rgba(0,0,0,0.22)' : isDisabled(lm.district) ? 'transparent' : 'rgba(255,255,255,0.75)'" />
        <text :x="lm.x + 13" :y="lm.y - 6.5" font-size="8" font-weight="700" :fill="isSelected(lm.district) ? '#ffffff' : isDisabled(lm.district) ? 'rgba(150,180,155,0.4)' : '#1A4A28'" font-family="Noto Sans KR,sans-serif" letter-spacing="-0.3">
          {{ lm.name }}
        </text>
      </g>
    </svg>

    <div class="flex items-center justify-between mt-3">
      <div class="flex flex-wrap gap-2">
        <span v-if="modelValue.length === 0" class="text-xs text-muted-foreground">서울 전 지역 대상</span>
        <button
          v-for="id in modelValue"
          :key="id"
          @click="emit('update:modelValue', modelValue.filter((x) => x !== id))"
          class="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full"
        >
          {{ id }} <X :size="11" />
        </button>
      </div>
      <span class="text-xs text-muted-foreground">{{ modelValue.length }}/{{ max }}</span>
    </div>
  </div>
</template>
