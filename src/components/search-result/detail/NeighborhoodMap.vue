<script setup>
import { ref, computed } from "vue";
import { MAP_MARKER_SETS } from "../../../utils/mockData";

const props = defineProps({
  dong: { type: String, required: true },
  hash: { type: Number, required: true },
  mode: { type: String, required: true }, // "infra" | "safety" | "transit"
});

const W = 560;
const H = 280;
const set = computed(() => MAP_MARKER_SETS[props.mode]);
const modeLabel = { infra: "생활 인프라", safety: "치안 시설", transit: "교통 시설" };

const active = ref(new Set(set.value.map((c) => c.label)));
function toggleCat(label) {
  const next = new Set(active.value);
  if (next.has(label)) next.delete(label);
  else next.add(label);
  active.value = next;
}

function sr(a, b) {
  const x = Math.sin(a * 317 + b * 97 + props.hash * 53) * 43758.5453;
  return x - Math.floor(x);
}

const majorStrokes = "#FFFFFF";
const minorStrokes = "#F0EDE6";
const roads = [
  { d: `M0,${H * 0.38} Q${W * 0.25},${H * 0.34} ${W},${H * 0.38}`, w: 10, c: majorStrokes },
  { d: `M0,${H * 0.7} L${W},${H * 0.7}`, w: 7, c: majorStrokes },
  { d: `M${W * 0.32},0 L${W * 0.32},${H}`, w: 10, c: majorStrokes },
  { d: `M${W * 0.65},0 L${W * 0.65},${H}`, w: 7, c: majorStrokes },
  { d: `M0,${H * 0.18} L${W * 0.65},${H * 0.18}`, w: 4, c: minorStrokes },
  { d: `M${W * 0.32},${H * 0.55} L${W},${H * 0.55}`, w: 4, c: minorStrokes },
  { d: `M0,${H * 0.85} L${W * 0.32},${H * 0.85}`, w: 4, c: minorStrokes },
  { d: `M${W * 0.16},0 L${W * 0.16},${H * 0.38}`, w: 4, c: minorStrokes },
  { d: `M${W * 0.48},${H * 0.38} L${W * 0.48},${H}`, w: 4, c: minorStrokes },
  { d: `M${W * 0.8},${H * 0.38} L${W * 0.8},${H * 0.7}`, w: 4, c: minorStrokes },
  { d: `M0,${H * 0.52} Q${W * 0.15},${H * 0.47} ${W * 0.32},${H * 0.38}`, w: 4, c: minorStrokes },
];
const blocks = [
  { x: 2, y: 2, w: W * 0.15, h: H * 0.17 }, { x: W * 0.17, y: 2, w: W * 0.14, h: H * 0.17 },
  { x: 2, y: H * 0.19, w: W * 0.15, h: H * 0.18 }, { x: W * 0.17, y: H * 0.19, w: W * 0.14, h: H * 0.18 },
  { x: 2, y: H * 0.39, w: W * 0.31, h: H * 0.30 }, { x: 2, y: H * 0.71, w: W * 0.31, h: H * 0.28 },
  { x: W * 0.33, y: 2, w: W * 0.14, h: H * 0.37 }, { x: W * 0.49, y: 2, w: W * 0.15, h: H * 0.37 },
  { x: W * 0.33, y: H * 0.39, w: W * 0.14, h: H * 0.15 }, { x: W * 0.49, y: H * 0.39, w: W * 0.15, h: H * 0.15 },
  { x: W * 0.33, y: H * 0.56, w: W * 0.30, h: H * 0.13 }, { x: W * 0.33, y: H * 0.71, w: W * 0.30, h: H * 0.28 },
  { x: W * 0.66, y: H * 0.39, w: W * 0.13, h: H * 0.15 }, { x: W * 0.81, y: H * 0.39, w: W * 0.19, h: H * 0.30 },
  { x: W * 0.66, y: H * 0.56, w: W * 0.13, h: H * 0.43 }, { x: W * 0.66, y: 2, w: W * 0.32, h: H * 0.17 },
];

const allMarkers = computed(() => {
  const markers = [];
  let seed = 0;
  const pad = 22;
  for (const cat of set.value) {
    const count = Math.max(1, cat.baseCount + Math.floor(sr(seed, 7) * 2) - 1);
    for (let i = 0; i < count; i++) {
      let mx = 0, my = 0, tries = 0;
      do {
        mx = pad + sr(seed + i, 1) * (W - pad * 2);
        my = pad + sr(seed + i + tries, 2) * (H - pad * 2);
        tries++;
      } while (tries < 8 && markers.some((m) => Math.hypot(m.x - mx, m.y - my) < 30));
      markers.push({ x: mx, y: my, label: cat.label, color: cat.color, idx: seed + i });
    }
    seed += 20;
  }
  return markers;
});

const visibleMarkers = computed(() => allMarkers.value.filter((m) => active.value.has(m.label)));

function labelX(m) {
  const labelW = m.label.length * 6.2 + 8;
  const lx = m.x + 14;
  const flip = lx + labelW > W - 4;
  return flip ? m.x - labelW - 6 : lx;
}
function labelW(m) {
  return m.label.length * 6.2 + 8;
}
</script>

<template>
  <div class="bg-card border border-border rounded-2xl overflow-hidden">
    <div class="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
      <h4 class="font-semibold text-foreground text-sm">{{ dong }} 주변 {{ modeLabel[mode] }} 지도</h4>
      <span class="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">모의 데이터 기반</span>
    </div>

    <div class="px-5 py-3 border-b border-border/50 flex flex-wrap gap-2">
      <button
        v-for="cat in set"
        :key="cat.label"
        @click="toggleCat(cat.label)"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
        :style="active.has(cat.label) ? { background: cat.color + '18', borderColor: cat.color, color: cat.color } : { background: 'transparent', borderColor: '#D1D5DB', color: '#9CA3AF' }"
      >
        <span class="w-2 h-2 rounded-full flex-shrink-0 transition-all" :style="{ background: active.has(cat.label) ? cat.color : '#D1D5DB' }" />
        {{ cat.label }}
      </button>
    </div>

    <div class="relative">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" style="background: #EDE9DF">
        <rect v-for="(b, i) in blocks" :key="i" :x="b.x" :y="b.y" :width="b.w" :height="b.h" :fill="i % 2 === 0 ? '#DDD8CE' : '#E4DFD4'" />
        <rect :x="W * 0.66" :y="H * 0.19" :width="W * 0.32" :height="H * 0.19" :rx="3" fill="#C8DDB6" />
        <text :x="W * 0.82" :y="H * 0.30" text-anchor="middle" font-size="9" fill="#5A8040" font-weight="600">공원·녹지</text>
        <path v-for="(r, i) in roads" :key="i" :d="r.d" :stroke="r.c" :stroke-width="r.w" fill="none" stroke-linecap="round" />
        <path :d="`M0,${H * 0.38} Q${W * 0.25},${H * 0.34} ${W},${H * 0.38}`" stroke="#F5F0E8" stroke-width="1" stroke-dasharray="8 6" fill="none" opacity="0.6" />
        <path :d="`M${W * 0.32},0 L${W * 0.32},${H}`" stroke="#F5F0E8" stroke-width="1" stroke-dasharray="8 6" fill="none" opacity="0.6" />
        <g v-for="m in visibleMarkers" :key="m.idx">
          <ellipse :cx="m.x" :cy="m.y + 13" rx="5" ry="2" fill="rgba(0,0,0,0.12)" />
          <path d="M0,-13 C-7,-13 -9,-8 -9,-4.5 C-9,2 0,11 0,11 C0,11 9,2 9,-4.5 C9,-8 7,-13 0,-13 Z" :transform="`translate(${m.x},${m.y})`" :fill="m.color" />
          <circle :cx="m.x" :cy="m.y - 4.5" r="4" fill="white" opacity="0.75" />
          <rect :x="labelX(m)" :y="m.y - 18" :width="labelW(m)" height="13" rx="3" fill="white" fill-opacity="0.92" :stroke="m.color" stroke-width="0.8" />
          <text :x="labelX(m) + labelW(m) / 2" :y="m.y - 8" text-anchor="middle" font-size="8" :fill="m.color" font-weight="700">{{ m.label }}</text>
        </g>
      </svg>
      <div v-if="active.size === 0" class="absolute inset-0 flex items-center justify-center">
        <p class="text-sm text-muted-foreground bg-white/80 px-4 py-2 rounded-xl border border-border">표시할 카테고리를 선택해주세요</p>
      </div>
      <div class="absolute bottom-2.5 left-2.5 text-[9px] text-muted-foreground/70 bg-white/80 px-2 py-0.5 rounded-md">{{ dong }} 반경 500m</div>
    </div>
  </div>
</template>
