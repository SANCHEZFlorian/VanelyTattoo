<script setup>
import { ref } from 'vue'

const openSection = ref(0) // Default open first section

const sections = [
  {
    title: "Dashboard & Vue d'ensemble",
    icon: 'fas fa-chart-line',
    color: 'text-purple-600',
    content: [
      {
        subtitle: 'Bilan du Jour',
        text: 'Ce widget affiche les rendez-vous terminés aujourd\'hui. Il sert de passerelle pour transformer rapidement un booking terminé en entrée de galerie (Portfolio). En cliquant sur "Publier", vous marquez le flash comme "Tatoué" et créez l\'entrée portfolio correspondante.',
      },
      {
        subtitle: 'Statistiques',
        text: 'Les vues des Flashs et de la Galerie sont incrémentées à chaque ouverture de modal par un visiteur unique.',
      },
    ],
  },
  {
    title: 'Gestion des Flashs',
    icon: 'fas fa-bolt',
    color: 'text-yellow-600',
    content: [
      {
        subtitle: 'Statuts de Flash',
        text: `
          <ul class="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Disponible (Active) :</strong> Visible sur le site, réservable par tout le monde.</li>
            <li><strong>Réservé (Reserved) :</strong> Visible avec un badge "RÉSERVÉ", réservation bloquée. Utile lorsqu'un acompte est en attente.</li>
            <li><strong>Tatoué (Tattooed) :</strong> Masqué de la page Flash publique. Doit être déplacé vers la Galerie pour rester visible comme archive.</li>
            <li><strong>Standby :</strong> Masqué partout (brouillon).</li>
          </ul>
        `,
      },
      {
        subtitle: 'Prix & Promotions',
        text: 'Si une "Promo Price" est définie et inférieure au prix standard, elle s\'affiche en rouge (ex: <span class="line-through text-gray-400">150€</span> <span class="text-red-600 font-bold">100€</span>). Le tri par prix prend en compte cette réduction.',
      },
    ],
  },
  {
    title: 'Galerie & Portfolio',
    icon: 'fas fa-images',
    color: 'text-pink-600',
    content: [
      {
        subtitle: 'Différence Flash / Galerie',
        text: 'Les Flashs sont des produits à vendre. La Galerie est votre vitrine de réalisations. Une fois un flash tatoué, il ne devrait plus être dans "Flashs" (ou alors en statut Tattooed/Masqué) mais dans "Galerie" pour montrer votre travail.',
      },
      {
        subtitle: "Upload d'Images",
        text: "Les images sont stockées sur Supabase Storage. La suppression d'une entrée galerie ne supprime pas automatiquement l'image du stockage pour éviter les orphelins, mais le lien en base est retiré.",
      },
    ],
  },
  {
    title: 'Réservations & Calendrier',
    icon: 'fas fa-calendar-alt',
    color: 'text-blue-600',
    content: [
      {
        subtitle: 'Flux de Confirmation',
        text: 'Une demande arrive en statut "Pending". Après validation (téléphone/email), vous pouvez la passer en "Confirmed". Cela envoie un email au client (si configuré) et bloque le créneau.',
      },
      {
        subtitle: 'Exceptions',
        text: 'Via l\'onglet "Calendrier", vous pouvez bloquer des créneaux spécifiques (vacances, maladie) sans toucher aux horaires d\'ouverture généraux.',
      },
    ],
  },
  {
    title: 'Contenu (Blog, Messages)',
    icon: 'fas fa-newspaper',
    color: 'text-green-600',
    content: [
      {
        subtitle: 'Blog',
        text: "Les articles améliorent votre SEO. Utilisez des titres accrocheurs. Une image de couverture est obligatoire pour un bon affichage sur l'accueil.",
      },
      {
        subtitle: 'Messages',
        text: 'Les demandes de contact générales arrivent ici. Les demandes spécifiques à un flash arrivent dans "Réservations".',
      },
    ],
  },
  {
    title: 'Paramètres & Ressources',
    icon: 'fas fa-cogs',
    color: 'text-gray-600',
    content: [
      {
        subtitle: 'Bannières',
        text: "Gérez les images du carrousel d'accueil. Activez/Désactivez selon les saisons ou les guests.",
      },
      {
        subtitle: 'Ressources (PDF)',
        text: 'Uploadez ici les fiches de soins et les décharges. Ces liens sont publics et peuvent être envoyés aux clients.',
      },
    ],
  },
]
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="space-y-4">
      <div
        v-for="(section, index) in sections"
        :key="index"
        class="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300"
        :class="
          openSection === index ? 'shadow-md border-purple-200 bg-purple-50/30' : 'bg-white'
        "
      >
        <button
          @click="openSection = openSection === index ? -1 : index"
          class="w-full flex items-center justify-between p-5 text-left focus:outline-none"
        >
          <div class="flex items-center gap-3">
            <i :class="[section.icon, section.color]" class="text-lg w-6"></i>
            <span class="font-semibold text-gray-700 text-lg">{{ section.title }}</span>
          </div>
          <i
            class="fas fa-chevron-down transition-transform duration-300 text-gray-400"
            :class="openSection === index ? 'rotate-180 text-purple-500' : ''"
          ></i>
        </button>

        <div
          v-show="openSection === index"
          class="px-5 pb-5 pt-0 text-gray-600 space-y-6 animate-in slide-in-from-top-2 duration-200"
        >
          <hr class="border-gray-100 mb-4" />
          <div v-for="(item, i) in section.content" :key="i" class="pl-9">
            <h3 class="font-bold text-gray-800 mb-2">{{ item.subtitle }}</h3>
            <div
              class="prose prose-sm max-w-none text-gray-600 leading-relaxed"
              v-html="item.text"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
