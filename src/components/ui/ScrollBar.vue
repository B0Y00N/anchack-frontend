<script setup>
// 네이티브 overflow-auto 스크롤을 사용하므로 별도 스크롤바 컴포넌트는 사실상 no-op입니다.
// (ScrollArea.vue의 <style scoped> 에서 스크롤바 모양만 커스터마이징)
defineProps({ orientation: { type: String, default: "vertical" } });
</script>
<template></template>
