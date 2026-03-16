<script setup>
import { ref } from 'vue'
import { useInfoStore } from '../../stores/info'

const infoStore = useInfoStore()
const activeStepIndex = ref(0)
const hoveredIndex = ref(null)

const handleStepHover = (index) => {
  activeStepIndex.value = index
  hoveredIndex.value = index
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-800">Comment ça marche ?</h1>

    <div class="max-w-6xl mx-auto">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Steps Column -->
        <div class="space-y-6" @mouseleave="hoveredIndex = null">
          <div
            v-for="(step, index) in infoStore.steps"
            :key="step.id"
            class="group flex items-start space-x-6 p-6 rounded-2xl transition-all duration-300 cursor-default"
            :class="
              hoveredIndex === index
                ? 'bg-white shadow-xl ring-1 ring-blue-100'
                : 'hover:bg-gray-50'
            "
            @mouseenter="handleStepHover(index)"
            @mouseleave="hoveredIndex = null"
          >
            <div
              class="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300"
              :class="
                hoveredIndex === index
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'
              "
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <h3
                class="text-xl font-bold mb-2 transition-colors duration-300"
                :class="hoveredIndex === index ? 'text-gray-900' : 'text-gray-600'"
              >
                {{ step.title }}
              </h3>
              <p
                class="text-gray-500 leading-relaxed transition-colors duration-300"
                :class="hoveredIndex === index ? 'text-gray-600' : 'text-gray-400'"
              >
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Dynamic Image Column -->
        <div
          class="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl hidden lg:block bg-gray-100"
        >
          <TransitionGroup name="fade">
            <img
              v-for="(step, index) in infoStore.steps"
              :key="step.id"
              v-show="activeStepIndex === index"
              :src="step.image || '/images/process.png'"
              :alt="step.title"
              class="absolute inset-0 w-full h-full object-cover"
            />
          </TransitionGroup>
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          ></div>
          <div class="absolute bottom-10 left-10 text-white max-w-xs">
            <p class="font-black text-2xl mb-2">{{ infoStore.steps[activeStepIndex]?.title }}</p>
            <p class="text-sm font-medium opacity-80 leading-relaxed">
              {{ infoStore.steps[activeStepIndex]?.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
