<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  scrollSelector: {
    type: String,
    default: null, // If null, uses window
  },
  threshold: {
    type: Number,
    default: 300,
  },
})

const isVisible = ref(false)

const scrollToTop = () => {
  const target = props.scrollSelector ? document.querySelector(props.scrollSelector) : window

  if (target) {
    target.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

const handleScroll = () => {
  const target = props.scrollSelector ? document.querySelector(props.scrollSelector) : window

  if (!target) return

  const scrollTop = props.scrollSelector ? target.scrollTop : window.scrollY
  isVisible.value = scrollTop > props.threshold
}

onMounted(() => {
  const target = props.scrollSelector ? document.querySelector(props.scrollSelector) : window

  if (target) {
    target.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const target = props.scrollSelector ? document.querySelector(props.scrollSelector) : window

  if (target) {
    target.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <Transition name="fade">
    <button
      v-if="isVisible"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 p-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center w-12 h-12"
      aria-label="Retour en haut"
    >
      <i class="fas fa-chevron-up"></i>
    </button>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
