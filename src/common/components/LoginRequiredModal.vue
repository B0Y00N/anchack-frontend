<script setup>
import { useRouter } from "vue-router";
import { LogIn } from "lucide-vue-next";

defineProps({
  message: {
    type: String,
    default: "로그인한 회원만 이용할 수 있는 기능이에요.",
  },
});
const emit = defineEmits(["close"]);
const router = useRouter();

function goLogin() {
  emit("close");
  router.push("/login");
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    @click="emit('close')"
  >
    <div
      class="bg-card w-full max-w-[380px] rounded-2xl shadow-2xl border border-border p-8 text-center"
      @click.stop
    >
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <LogIn :size="24" class="text-primary" />
      </div>
      <h3 class="text-lg font-bold text-foreground mb-1.5">로그인이 필요해요</h3>
      <p class="text-sm text-muted-foreground mb-6">{{ message }}</p>
      <div class="flex gap-3">
        <button
          @click="emit('close')"
          class="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          취소
        </button>
        <button
          @click="goLogin"
          class="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
        >
          로그인하기
        </button>
      </div>
    </div>
  </div>
</template>
