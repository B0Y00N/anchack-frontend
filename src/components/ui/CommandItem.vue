<script setup>
import { inject, computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  value: { type: String, default: "" }, // 검색 매칭용 텍스트
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["select"]);
const command = inject("command", null);

const visible = computed(() => {
  const q = (command?.search.value || "").toLowerCase().trim();
  if (!q) return true;
  return props.value.toLowerCase().includes(q);
});

function onClick() {
  if (props.disabled) return;
  emit("select", props.value);
}
</script>

<template>
  <div
    v-if="visible"
    data-slot="command-item"
    :data-disabled="disabled"
    @click="onClick"
    :class="cn(
      'hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
