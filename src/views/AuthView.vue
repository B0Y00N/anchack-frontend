<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import LoginForm from "../components/auth/LoginForm.vue";
import SignUpForm from "../components/auth/SignUpForm.vue";

const route = useRoute();
const isSignup = computed(() => route.path === "/signup");
</script>

<template>
  <SignUpForm v-if="isSignup" />
  <LoginForm v-else />
</template>
