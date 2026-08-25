<script setup>
import { useRouter } from "vue-router";
import HomeHero from "../components/HomeHero.vue";
import HomeServiceCards from "../components/HomeServiceCards.vue";
import HomeProcessSteps from "../components/HomeProcessSteps.vue";
import HomeReviewVoices from "../components/HomeReviewVoices.vue";
import TheFooter from "../../common/components/TheFooter.vue";
import { useSearchStore } from "../../condition/stores/useSearchStore";
import { useNeighborhoodStore } from "../../region/stores/useNeighborhoodStore";

const router = useRouter();
const search = useSearchStore();
const nbhd = useNeighborhoodStore();

function start() {
  search.reset();
  nbhd.resetCompare();
  router.push("/search/step/1");
}
function navigate(page) {
  const map = { explore: "/explore" };
  router.push(map[page] || "/");
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <HomeHero @start="start" @navigate="navigate" />
    <HomeServiceCards @start="start" @navigate="navigate" />
    <HomeProcessSteps />
    <HomeReviewVoices @explore="navigate('explore')" />
    <TheFooter />
  </div>
</template>
