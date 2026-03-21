<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: String,
    default: '2xl',
  },
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true">
        <!-- Container for centering -->
        <div
          class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        >
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-sm"
            aria-hidden="true"
            @click="$emit('close')"
          ></div>

          <!-- Spacer -->
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
            >&#8203;</span
          >

          <!-- Modal Panel -->
          <div
            class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full relative z-10"
            :class="{
              'max-w-md': maxWidth === 'md',
              'max-w-lg': maxWidth === 'lg',
              'max-w-xl': maxWidth === 'xl',
              'max-w-2xl': maxWidth === '2xl',
              'max-w-3xl': maxWidth === '3xl',
              'max-w-4xl': maxWidth === '4xl',
              'max-w-5xl': maxWidth === '5xl',
              'max-w-6xl': maxWidth === '6xl',
              'max-w-full': maxWidth === 'full'
            }"
            @click.stop
          >
            <!-- Header -->
            <div
              class="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center"
            >
              <h3 class="text-xl font-bold text-gray-900 leading-6">
                {{ title }}
              </h3>
              <button
                type="button"
                class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                @click="$emit('close')"
              >
                <span class="sr-only">Fermer</span>
                <i class="fas fa-times text-2xl"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-6 bg-white">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div
              v-if="$slots.footer"
              class="bg-white px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100"
            >
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .inline-block,
.modal-leave-active .inline-block {
  transition: all 0.3s ease;
}

.modal-enter-from .inline-block,
.modal-leave-to .inline-block {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
