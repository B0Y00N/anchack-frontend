<script setup>
import { ref } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  char: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["update"]);
const isActive = ref(false);

function onInput(e) {
  emit("update", e.target.value);
}
</script>

<template>
  <div
    data-slot="input-otp-slot"
    :data-active="isActive"
    :class="cn(
      'data-[active=true]:border-ring data-[active=true]:ring-ring/50 dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]',
      props.class,
    )"
  >
    <input
      type="text"
      maxlength="1"
      :value="char"
      :disabled="disabled"
      class="absolute inset-0 w-full h-full text-center bg-transparent outline-none"
      @input="onInput"
      @focus="isActive = true"
      @blur="isActive = false"
    />
  </div>
</template>
