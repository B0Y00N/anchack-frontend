<script setup>
import { inject, computed, useSlots, onMounted, watch } from "vue";
import { Check } from "lucide-vue-next";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  value: { type: String, required: true },
});
const select = inject("select", null);
const selected = computed(() => select?.modelValue() === props.value);

// 슬롯 텍스트를 라벨로 등록 (SelectValue에서 표시용으로 사용)
const slots = useSlots();
function registerLabel() {
  const nodes = slots.default?.();
  const text = nodes?.map((n) => (typeof n.children === "string" ? n.children : "")).join("") ?? "";
  select?.registerLabel(props.value, text);
}
onMounted(registerLabel);
watch(() => props.value, registerLabel);
</script>

<template>
  <div
    data-slot="select-item"
    @click="select?.select(value)"
    :class="cn(
      'hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
      props.class,
    )"
  >
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      <Check v-if="selected" class="size-4" />
    </span>
    <slot />
  </div>
</template>
