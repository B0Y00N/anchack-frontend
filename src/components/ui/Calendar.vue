<script setup>
import { ref, computed } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { buttonVariants } from "../../lib/variants/button";
import { cn } from "../../lib/utils";

// 참고: react-day-picker는 React 전용 라이브러리라 그대로 옮길 수 없어 직접 구현했습니다.
// 우선 단일 날짜 선택(mode="single")만 지원합니다. range/multiple이 필요하면 추가 구현이 필요해요.
const props = defineProps({
  class: { type: String, default: "" },
  modelValue: { type: Date, default: null },
});
const emit = defineEmits(["update:modelValue"]);

const today = new Date();
const viewDate = ref(props.modelValue ? new Date(props.modelValue) : new Date());

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

const days = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
});

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function selectDay(day) {
  if (!day) return;
  emit("update:modelValue", day);
}

function prevMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1);
}
function nextMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1);
}
</script>

<template>
  <div data-slot="calendar" :class="cn('p-3', props.class)">
    <div class="flex flex-col gap-4">
      <div class="flex justify-center pt-1 relative items-center w-full">
        <button
          type="button"
          @click="prevMonth"
          :class="cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1')"
        >
          <ChevronLeft class="size-4" />
        </button>
        <span class="text-sm font-medium">{{ viewDate.getFullYear() }}년 {{ viewDate.getMonth() + 1 }}월</span>
        <button
          type="button"
          @click="nextMonth"
          :class="cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1')"
        >
          <ChevronRight class="size-4" />
        </button>
      </div>

      <table class="w-full border-collapse space-x-1">
        <thead>
          <tr class="flex">
            <th v-for="wd in weekDays" :key="wd" class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">{{ wd }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, wi) in Math.ceil(days.length / 7)" :key="wi" class="flex w-full mt-2">
            <td v-for="(day, di) in days.slice(wi * 7, wi * 7 + 7)" :key="di" class="relative p-0 text-center text-sm">
              <button
                v-if="day"
                type="button"
                @click="selectDay(day)"
                :class="cn(
                  buttonVariants({ variant: 'ghost' }),
                  'size-8 p-0 font-normal',
                  isSameDay(day, modelValue) && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                  isSameDay(day, today) && !isSameDay(day, modelValue) && 'bg-accent text-accent-foreground',
                )"
              >
                {{ day.getDate() }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
