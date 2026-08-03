<script setup>
defineProps({ size: { type: Number, default: 32 } });
</script>
<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="9" fill="#2D7A4F" />
    <path d="M16 26V14" stroke="white" stroke-width="2" stroke-linecap="round" />
    <path d="M16 20C16 16.5 12.5 13 9 13C9 17.5 12.5 20 16 20Z" fill="white" />
    <path d="M16 17.5C16 14 19.5 11.5 23 11.5C23 16 19.5 17.5 16 17.5Z" fill="white" fill-opacity="0.72" />
  </svg>
</template>
