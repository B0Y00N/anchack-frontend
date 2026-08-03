<script setup>
import AvatarPlaceholder from "../../common/components/AvatarPlaceholder.vue";
defineProps({ userProfile: { type: Object, required: true } });
</script>
<template>
  <div class="max-w-4xl mx-auto px-8 py-6 flex items-center gap-5">
    <AvatarPlaceholder :name="userProfile.name" :size="64" />
  </div>
</template>
