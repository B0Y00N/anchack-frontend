// sonner(React 토스트 라이브러리)를 대체하는 간단한 자체 구현.
// 실제 프로젝트에서는 npm의 "vue-sonner" 패키지를 쓰는 것도 방법입니다 (API가 거의 동일합니다).
import { reactive } from "vue";

const toasts = reactive([]);
let idSeq = 0;

export function toast(message, options = {}) {
  const id = ++idSeq;
  toasts.push({ id, message, type: options.type || "default", duration: options.duration ?? 3000 });
  setTimeout(() => {
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx !== -1) toasts.splice(idx, 1);
  }, options.duration ?? 3000);
}

toast.success = (msg, options) => toast(msg, { ...options, type: "success" });
toast.error = (msg, options) => toast(msg, { ...options, type: "error" });

export function useToast() {
  return { toasts, toast };
}
