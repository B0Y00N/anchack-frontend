<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSearchStore } from "../stores/useSearchStore";
import StepCommute from "../components/search-input/StepCommute.vue";
import StepPriority from "../components/search-input/StepPriority.vue";
import StepBudget from "../components/search-input/StepBudget.vue";
import StepHousing from "../components/search-input/StepHousing.vue";
import StepConfirm from "../components/search-input/StepConfirm.vue";
import SearchLoading from "../components/search-input/SearchLoading.vue";

const route = useRoute();
const router = useRouter();
const search = useSearchStore();

const step = computed(() => Number(route.params.step) || 1);
const isLoading = computed(() => route.path === "/search/loading");

function update(patch) {
  search.update(patch);
}
function goStep(n) {
  router.push(`/search/step/${n}`);
}
function submit() {
  router.push("/search/loading");
}
function onLoadingDone() {
  router.push("/search/results");
}
</script>

<template>
  <SearchLoading v-if="isLoading" @done="onLoadingDone" />
  <StepCommute v-else-if="step === 1" :state="search.appState" @update="update" @next="goStep(2)" />
  <StepPriority v-else-if="step === 2" :state="search.appState" @update="update" @next="goStep(3)" @prev="goStep(1)" />
  <StepBudget v-else-if="step === 3" :state="search.appState" @update="update" @next="goStep(4)" @prev="goStep(2)" />
  <StepHousing v-else-if="step === 4" :state="search.appState" @update="update" @next="goStep(5)" @prev="goStep(3)" />
  <StepConfirm v-else-if="step === 5" :state="search.appState" @update="update" @submit="submit" @prev="goStep(4)" />
</template>
