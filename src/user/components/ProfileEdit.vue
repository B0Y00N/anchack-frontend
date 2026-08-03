<script setup>
import { ref } from "vue";
import { User } from "lucide-vue-next";
import AvatarPlaceholder from "../../common/components/AvatarPlaceholder.vue";

const props = defineProps({
  userProfile: { type: Object, required: true },
  isSocialLogin: { type: Boolean, default: false },
});
const emit = defineEmits(["save"]);

const editing = ref(false);
const editForm = ref({ ...props.userProfile });

function startEdit() {
  editForm.value = { ...props.userProfile };
  editing.value = true;
}
function save() {
  emit("save", editForm.value);
  editing.value = false;
}

const fields = [
  { label: "이름", key: "name", placeholder: "홍길동" },
  { label: "닉네임", key: "nickname", placeholder: "예) 서울새내기" },
];
</script>

<template>
  <div>
    <div v-if="isSocialLogin" class="bg-card border border-border rounded-2xl p-8 text-center">
      <p class="text-sm text-muted-foreground">소셜 로그인 상태입니다.</p>
    </div>

    <div v-else-if="editing" class="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div class="flex justify-center mb-2">
        <div class="relative">
          <AvatarPlaceholder :name="editForm.name || '?'" :size="80" />
          <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer">
            <User :size="13" class="text-white" />
          </div>
        </div>
      </div>
      <div v-for="f in fields" :key="f.key">
        <label class="block text-sm font-semibold text-foreground mb-1.5">{{ f.label }}</label>
        <input v-model="editForm[f.key]" :placeholder="f.placeholder" class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div class="flex gap-3 pt-2">
        <button @click="editing = false" class="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted">취소</button>
        <button @click="save" class="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90">저장</button>
      </div>
    </div>

    <div v-else class="flex justify-center pt-4">
      <button @click="startEdit" class="text-sm font-semibold text-primary border border-primary/25 px-6 py-2.5 rounded-full hover:bg-secondary">개인정보 수정하기</button>
    </div>
  </div>
</template>
