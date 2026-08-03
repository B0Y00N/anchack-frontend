<script setup>
import { ref, computed } from "vue";
import TabCommute from "./TabCommute.vue";
import TabHousing from "./TabHousing.vue";
import TabSafety from "./TabSafety.vue";
import TabInfra from "./TabInfra.vue";

const props = defineProps({ n: { type: Object, required: true } });
const emit = defineEmits(["listings"]);

const TABS = ["통근", "주거비", "치안", "생활 인프라"];
const tab = ref("통근");

const hash = computed(() => props.n.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 20);
</script>

<template>
  <div>
    <div class="flex border-b border-border mb-8">
      <button
        v-for="t in TABS"
        :key="t"
        @click="tab = t"
        :class="`px-6 py-3.5 text-sm font-semibold border-b-2 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`"
      >
        {{ t }}
      </button>
    </div>

    <TabCommute v-if="tab === '통근'" :n="n" :hash="hash" />
    <TabHousing v-else-if="tab === '주거비'" :n="n" @listings="emit('listings')" />
    <TabSafety v-else-if="tab === '치안'" :n="n" :hash="hash" />
    <TabInfra v-else-if="tab === '생활 인프라'" :n="n" :hash="hash" />
  </div>
</template>
