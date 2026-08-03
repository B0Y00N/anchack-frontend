<script setup>
import { ref, computed, provide, onMounted, onUnmounted } from "vue";
import { useIsMobile } from "../../composables/useIsMobile";
import { cn } from "../../lib/utils";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

const props = defineProps({
  class: { type: String, default: "" },
  defaultOpen: { type: Boolean, default: true },
  modelValue: { type: Boolean, default: undefined }, // open (제어형으로 쓰고 싶을 때)
});
const emit = defineEmits(["update:modelValue"]);

const isMobile = useIsMobile();
const openMobile = ref(false);
const internalOpen = ref(props.defaultOpen);
const isControlled = props.modelValue !== undefined;

const open = computed(() => (isControlled ? props.modelValue : internalOpen.value));

function setOpen(value) {
  const next = typeof value === "function" ? value(open.value) : value;
  if (isControlled) emit("update:modelValue", next);
  else internalOpen.value = next;
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

function toggleSidebar() {
  if (isMobile.value) openMobile.value = !openMobile.value;
  else setOpen((v) => !v);
}

function handleKeyDown(e) {
  if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    toggleSidebar();
  }
}
onMounted(() => window.addEventListener("keydown", handleKeyDown));
onUnmounted(() => window.removeEventListener("keydown", handleKeyDown));

const state = computed(() => (open.value ? "expanded" : "collapsed"));

provide("sidebar", { state, open, setOpen, isMobile, openMobile, setOpenMobile: (v) => (openMobile.value = v), toggleSidebar });
</script>

<template>
  <div
    data-slot="sidebar-wrapper"
    :style="{ '--sidebar-width': '16rem', '--sidebar-width-icon': '3rem' }"
    :class="cn('group/sidebar-wrapper flex min-h-svh w-full', props.class)"
  >
    <slot />
  </div>
</template>
