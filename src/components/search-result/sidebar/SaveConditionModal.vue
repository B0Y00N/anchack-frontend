<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "save"]);
const title = ref("");

function save() {
  if (title.value.trim()) emit("save", title.value.trim());
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click="emit('close')">
    <div class="bg-card w-full max-w-[400px] rounded-2xl shadow-2xl border border-border p-8" @click.stop>
      <h3 class="text-lg font-bold text-foreground mb-1.5">조건 저장하기</h3>
      <p class="text-sm text-muted-foreground mb-5">이 검색 조건에 이름을 붙여서 저장해요.</p>
      <input
        autofocus
        type="text"
        v-model="title"
        @keydown.enter="save"
        placeholder="예) 합정 근처 첫 자취방"
        class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 mb-5"
      />
      <div class="flex gap-3">
        <button @click="emit('close')" class="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted">취소</button>
        <button :disabled="!title.trim()" @click="save" class="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-40">저장</button>
      </div>
    </div>
  </div>
</template>
