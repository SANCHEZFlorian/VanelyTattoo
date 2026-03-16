<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useNotificationStore } from '../../stores/notification'

const notificationStore = useNotificationStore()
const timers = ref(new Map())
const pauses = ref(new Map())
const DURATION = 4000

// Helper to start/resume timer for a toast
const startTimer = (id) => {
  if (timers.value.has(id)) return

  const timer = setTimeout(() => {
    notificationStore.removeToast(id)
    timers.value.delete(id)
  }, DURATION)

  timers.value.set(id, timer)
}

// Watch for new toasts to start their timers
watch(
  () => notificationStore.toasts,
  (newToasts) => {
    newToasts.forEach((toast) => {
      if (!timers.value.has(toast.id) && !pauses.value.has(toast.id)) {
        startTimer(toast.id)
      }
    })
  },
  { deep: true, immediate: true },
)

const handleMouseEnter = (id) => {
  if (timers.value.has(id)) {
    clearTimeout(timers.value.get(id))
    timers.value.delete(id)
    pauses.value.set(id, true)
  }
}

const handleMouseLeave = (id) => {
  pauses.value.delete(id)
  startTimer(id)
}

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle'
    case 'error':
      return 'fas fa-exclamation-circle'
    case 'warning':
      return 'fas fa-exclamation-triangle'
    default:
      return 'fas fa-info-circle'
  }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'warning':
      return 'bg-amber-50 border-amber-200 text-amber-800'
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800'
  }
}

const getIconClass = (type) => {
  switch (type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-amber-500'
    default:
      return 'text-blue-500'
  }
}

onBeforeUnmount(() => {
  timers.value.forEach((timer) => clearTimeout(timer))
})
</script>

<template>
  <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-80">
    <TransitionGroup name="toast">
      <div
        v-for="toast in notificationStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-4 p-4 rounded-xl border shadow-xl backdrop-blur-md transform transition-all duration-300 cursor-pointer active:scale-95"
        :class="getTypeClass(toast.type)"
        @mouseenter="handleMouseEnter(toast.id)"
        @mouseleave="handleMouseLeave(toast.id)"
        @click="notificationStore.removeToast(toast.id)"
      >
        <div class="p-2 rounded-lg bg-white/50 shadow-sm mt-0.5">
          <i :class="[getIcon(toast.type), getIconClass(toast.type), 'text-lg']"></i>
        </div>
        <div class="flex-1 min-w-0 pt-0.5">
          <h4 class="font-bold text-sm mb-1 line-clamp-1">{{ toast.title }}</h4>
          <p v-if="toast.message" class="text-xs opacity-90 leading-relaxed line-clamp-3">
            {{ toast.message }}
          </p>
        </div>
        <button
          @click.stop="notificationStore.removeToast(toast.id)"
          class="p-1 hover:bg-black/5 rounded-lg transition-colors mt-0.5"
        >
          <i class="fas fa-times opacity-50 text-sm"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-move {
  transition: transform 0.4s ease;
}
</style>
