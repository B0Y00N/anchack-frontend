<script setup>
import { inject, ref } from "vue";
import { GripVertical } from "lucide-vue-next";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  withHandle: { type: Boolean, default: false },
});
const direction = inject("resizableDirection", "horizontal");
const handleEl = ref(null);

// 참고: react-resizable-panels 대신 마우스 드래그로 이전/다음 패널의 flex-basis를 직접 조정하는
// 간단한 구현입니다. 퍼센트 계산은 부모 컨테이너 크기를 기준으로 합니다.
function onMouseDown(e) {
  const handle = handleEl.value;
  const prevPanel = handle.previousElementSibling;
  const nextPanel = handle.nextElementSibling;
  if (!prevPanel || !nextPanel) return;

  const container = handle.parentElement;
  const containerSize = direction === "vertical" ? container.offsetHeight : container.offsetWidth;
  const startPos = direction === "vertical" ? e.clientY : e.clientX;
  const prevStartBasis = parseFloat(prevPanel.style.flexBasis) || 50;
  const nextStartBasis = parseFloat(nextPanel.style.flexBasis) || 50;

  function onMouseMove(ev) {
    const currentPos = direction === "vertical" ? ev.clientY : ev.clientX;
    const deltaPct = ((currentPos - startPos) / containerSize) * 100;
    prevPanel.style.flexBasis = Math.max(5, prevStartBasis + deltaPct) + "%";
    nextPanel.style.flexBasis = Math.max(5, nextStartBasis - deltaPct) + "%";
  }
  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}
</script>

<template>
  <div
    ref="handleEl"
    data-slot="resizable-handle"
    :data-panel-group-direction="direction"
    @mousedown="onMouseDown"
    :class="cn(
      'bg-border relative flex items-center justify-center cursor-col-resize',
      direction === 'vertical' ? 'h-px w-full cursor-row-resize' : 'w-px',
      props.class,
    )"
  >
    <div v-if="withHandle" class="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
      <GripVertical class="size-2.5" />
    </div>
  </div>
</template>
