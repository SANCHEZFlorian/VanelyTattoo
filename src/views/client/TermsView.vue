<script setup>
import { useInfoStore } from '../../stores/info'

const infoStore = useInfoStore()
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <h1 class="text-3xl font-bold font-serif text-gray-800 mb-8 border-b pb-4">
      Conditions Générales de Vente
    </h1>
    <div class="prose prose-purple max-w-none text-gray-700 whitespace-pre-line">
      {{ infoStore.legal.cgv }}
    </div>
  </div>
</template>
