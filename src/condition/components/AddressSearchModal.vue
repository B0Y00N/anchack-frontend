<script setup>
import { nextTick, onMounted, ref } from "vue";
import { LoaderCircle, RotateCw, X } from "lucide-vue-next";
import { loadKakaoPostcode } from "../../common/utils/loadKakaoPostcode";

const emit = defineEmits(["close", "select"]);

const postcodeContainer = ref(null);
const isLoading = ref(true);
const loadError = ref("");

async function showPostcodeSearch() {
  isLoading.value = true;
  loadError.value = "";

  try {
    const Postcode = await loadKakaoPostcode();
    await nextTick();

    if (!postcodeContainer.value) return;

    new Postcode({
      oncomplete(data) {
        emit("select", {
          zonecode: data.zonecode,
          address: data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
        });
      },
    }).embed(postcodeContainer.value, { width: "100%", height: "100%" });
  } catch (error) {
    loadError.value = error.message || "주소 검색 화면을 불러오지 못했습니다.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(showPostcodeSearch);
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    @click="emit('close')"
  >
    <div
      class="bg-card w-full max-w-[520px] rounded-2xl shadow-2xl border border-border overflow-hidden"
      @click.stop
    >
      <div class="px-6 py-4 border-b border-border">
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-foreground text-lg">우편번호 찾기</h2>
          <button @click="emit('close')" aria-label="닫기" class="p-1.5 rounded-lg hover:bg-muted">
            <X :size="18" class="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div class="h-[460px] relative">
        <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card text-sm text-muted-foreground">
          <LoaderCircle :size="22" class="animate-spin text-primary" />
          주소 검색 화면을 불러오는 중이에요.
        </div>
        <div v-else-if="loadError" class="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-sm text-muted-foreground">
          <p>{{ loadError }}</p>
          <button @click="showPostcodeSearch" class="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary">
            <RotateCw :size="15" /> 다시 시도
          </button>
        </div>
        <div ref="postcodeContainer" class="h-full w-full" />
      </div>
      <div class="px-6 py-3 bg-muted/40 border-t border-border">
        <p class="text-xs text-muted-foreground">
          도로명, 지번 또는 건물명으로 검색할 수 있어요.
        </p>
      </div>
    </div>
  </div>
</template>
