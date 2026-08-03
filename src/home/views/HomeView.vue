<script setup>
import { useRouter } from "vue-router";
import HomeHero from "../components/home/HomeHero.vue";
import HomeServiceCards from "../components/home/HomeServiceCards.vue";
import HomeProcessSteps from "../components/home/HomeProcessSteps.vue";
import TheFooter from "../components/common/TheFooter.vue";

const router = useRouter();

function start() {
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
    <TheFooter />
  </div>
</template>
