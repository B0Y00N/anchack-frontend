<script setup>
import { computed } from "vue";
import { cn } from "../../lib/utils";

const props = defineProps({
  class: { type: String, default: "" },
  modelValue: { type: Array, default: undefined }, // e.g. [30] or [20, 80]
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
});
const emit = defineEmits(["update:modelValue"]);

const values = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue : [props.min, props.max],
);

function pct(v) {
  return ((v - props.min) / (props.max - props.min)) * 100;
}

function onThumbInput(index, e) {
  const next = [...values.value];
  next[index] = Number(e.target.value);
  emit("update:modelValue", next);
}
</script>

<template>
  <div
    data-slot="slider"
    :class="cn(
      'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
      props.class,
    )"
  >
    <div data-slot="slider-track" class="bg-muted relative grow overflow-hidden rounded-full h-4 w-full">
      <div
        data-slot="slider-range"
        class="bg-primary absolute h-full"
        :style="{
          left: values.length > 1 ? pct(values[0]) + '%' : '0%',
          width: (values.length > 1 ? pct(values[1]) - pct(values[0]) : pct(values[0])) + '%',
        }"
      />
    </div>
    <input
      v-for="(v, i) in values"
      :key="i"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="v"
      @input="onThumbInput(i, $event)"
      data-slot="slider-thumb"
      class="absolute w-full h-4 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
    />
  </div>
</template>
