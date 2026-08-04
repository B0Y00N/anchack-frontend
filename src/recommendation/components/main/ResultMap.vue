<script setup>
const props = defineProps({ highlighted: { type: String, default: "" } });

const nodes = [
  { id: "증산동", x: 330, y: 235, r: 36 },
  { id: "응암1동", x: 195, y: 325, r: 32 },
  { id: "망원2동", x: 465, y: 312, r: 30 },
  { id: "신정3동", x: 160, y: 425, r: 28 },
  { id: "은제1동", x: 488, y: 412, r: 28 },
];
const TOP_IDS = ["증산동", "응암1동", "망원2동"];

function hex(cx, cy, r) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" L ");
  return `M ${pts} Z`;
}
function isTop(id) {
  return TOP_IDS.includes(id);
}
</script>

<template>
  <div class="w-full h-full relative overflow-hidden" style="background: #E4EDE7">
    <div
      class="absolute inset-0 opacity-[0.12] pointer-events-none"
      style="background-image: repeating-linear-gradient(0deg,#2D7A4F 0,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#2D7A4F 0,transparent 1px,transparent 48px); background-size: 48px 48px"
    />
    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 700 560" preserveAspectRatio="xMidYMid slice">
      <line x1="80" y1="195" x2="620" y2="195" stroke="#C8DAC9" stroke-width="14" stroke-linecap="round" />
      <line x1="315" y1="90" x2="315" y2="510" stroke="#C8DAC9" stroke-width="9" stroke-linecap="round" />
      <circle cx="443" cy="146" r="13" fill="#2D7A4F" /><circle cx="443" cy="146" r="7" fill="white" />
      <text x="462" y="143" font-size="12" fill="#2D7A4F" font-weight="700" font-family="Noto Sans KR,sans-serif">상암 DMC</text>
      <g v-for="n in nodes" :key="n.id">
        <path
          :d="hex(n.x, n.y, n.r + 4)"
          :fill="n.id === highlighted ? '#2D7A4F' : isTop(n.id) ? '#52B37A' : '#9ABFA6'"
          :fill-opacity="n.id === highlighted ? 0.95 : isTop(n.id) ? 0.75 : 0.55"
        />
        <text :x="n.x" :y="n.y + 4" text-anchor="middle" :font-size="n.id === highlighted ? 12 : 11" :font-weight="n.id === highlighted ? '700' : '600'" :fill="n.id === highlighted ? 'white' : '#1A2C21'" font-family="Noto Sans KR,sans-serif">
          {{ n.id }}
        </text>
      </g>
    </svg>
  </div>
</template>
