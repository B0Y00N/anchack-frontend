<script setup>
import DetailHeader from "./DetailHeader.vue";
import DetailSummary from "./DetailSummary.vue";
import DetailTabs from "./DetailTabs.vue";

const props = defineProps({
  n: { type: Object, required: true },
  isSaved: { type: Boolean, default: false },
  inCompare: { type: Boolean, default: false },
});
const emit = defineEmits(["back", "listings", "toggle-save", "compare"]);
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px]">
    <div class="max-w-5xl mx-auto px-8 py-8">
      <DetailHeader :n="n" :is-saved="isSaved" :in-compare="inCompare" @back="emit('back')" @listings="emit('listings')" @toggle-save="emit('toggle-save')" @compare="emit('compare')" />
      <DetailSummary :n="n" />
      <DetailTabs :n="n" @listings="emit('listings')" />
    </div>
  </div>
</template>
