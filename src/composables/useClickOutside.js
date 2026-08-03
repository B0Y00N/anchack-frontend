import { onMounted, onUnmounted } from "vue";

/**
 * elRef: template ref (ref(null))
 * onOutside: () => void
 */
export function useClickOutside(elRef, onOutside) {
  function handler(e) {
    if (elRef.value && !elRef.value.contains(e.target)) {
      onOutside(e);
    }
  }
  onMounted(() => document.addEventListener("mousedown", handler));
  onUnmounted(() => document.removeEventListener("mousedown", handler));
}
