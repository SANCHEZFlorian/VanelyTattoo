<script setup>
import { useInfoStore } from '../../stores/info'
const infoStore = useInfoStore()
const { about } = infoStore
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img
            :src="about.image"
            :alt="about.title"
            class="w-full rounded-lg shadow-lg object-cover object-top"
          />
        </div>
        <div class="space-y-6">
          <h1 class="text-4xl font-bold text-gray-800">{{ about.title }}</h1>
          <p class="text-lg text-gray-600">
            {{ about.description }}
          </p>
          <div v-if="about.style && about.style.length" class="space-y-4">
            <h3 class="text-xl font-semibold text-gray-800">Mon style</h3>
            <ul class="space-y-2 text-gray-600">
              <li v-for="style in about.style" :key="style.name" class="flex items-center">
                <i :class="[style.icon, 'mr-2']"></i> {{ style.name }}
              </li>
            </ul>
          </div>
          <div v-if="about.certifications && about.certifications.length" class="space-y-4">
            <h3 class="text-xl font-semibold text-gray-800">Certifications</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="cert in about.certifications"
                :key="cert"
                class="bg-pink-50 text-pink-700 border border-pink-100 px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ cert }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
