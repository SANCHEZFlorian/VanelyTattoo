<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-800">
      Conseils d'Entretien (Aftercare)
    </h1>

    <div class="space-y-12">
      <!-- Section 1 -->
      <section class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 class="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-3">
          <i class="fas fa-hand-sparkles"></i>
          Les premières heures
        </h2>
        <div class="prose prose-pink max-w-none text-gray-600 space-y-4">
          <p>
            Votre nouveau tatouage est une plaie ouverte. La façon dont vous en prenez soin
            déterminera son aspect final.
          </p>
          <ul class="list-disc pl-5 space-y-2">
            <li>
              <strong>Gardez le pansement :</strong> Laissez le film protecteur (scellé ou
              cellophane) pendant au moins 2 à 4 heures, ou selon les recommandations spécifiques de
              votre artiste.
            </li>
            <li>
              <strong>Premier nettoyage :</strong> Lavez-vous soigneusement les mains. Retirez
              délicatement le pansement. Lavez le tatouage à l'eau TIÈDE et avec un savon doux à pH
              neutre.
            </li>
            <li>
              <strong>Séchage :</strong> Tapotez doucement avec une serviette en papier propre. Ne
              jamais frotter.
            </li>
          </ul>
        </div>
      </section>

      <!-- Section 2 -->
      <section class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 class="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-3">
          <i class="fas fa-shield-alt"></i>
          La phase de cicatrisation (2-3 semaines)
        </h2>
        <div class="prose prose-pink max-w-none text-gray-600 space-y-4">
          <ul class="list-disc pl-5 space-y-2">
            <li>
              <strong>Hydratation :</strong> Appliquez une fine couche de pommade cicatrisante
              recommandée 2 à 3 fois par jour. Votre tatouage ne doit jamais être sec, mais ne
              l'étouffez pas sous trop de crème.
            </li>
            <li>
              <strong>Vêtements :</strong> Portez des vêtements amples et en coton pour éviter les
              frottements irritants.
            </li>
            <li>
              <strong>Ne pas gratter :</strong> Des croûtes vont se former et la peau va peler
              (comme un coup de soleil). C'est NORMAL. Ne grattez JAMAIS, laissez-les tomber
              d'elles-mêmes.
            </li>
          </ul>
        </div>
      </section>

      <!-- Section 3 -->
      <section class="bg-pink-50 p-8 rounded-2xl border border-pink-100">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <i class="fas fa-exclamation-triangle text-orange-500"></i>
          À ÉVITER ABSOLUMENT
        </h2>
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          <div class="bg-white p-4 rounded-xl shadow-sm">
            <h4 class="font-bold text-red-500 mb-2">IMMERSION</h4>
            <p>Pas de bains, piscines, mer, saunas ou hammams pendant au moins 3 semaines.</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm">
            <h4 class="font-bold text-red-500 mb-2">EXPOSITION SOLAIRE</h4>
            <p>
              Pas de soleil direct. Une fois cicatrisé, utilisez TOUJOURS une protection SPF 50+.
            </p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm">
            <h4 class="font-bold text-red-500 mb-2">SPORT INTENSE</h4>
            <p>
              Évitez les activités qui provoquent une transpiration excessive ou des étirements sur
              la zone.
            </p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm">
            <h4 class="font-bold text-red-500 mb-2">ANIMAUX</h4>
            <p>Empêchez vos animaux de compagnie de lécher ou de toucher la zone tatouée.</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <div class="text-center text-gray-400 text-sm italic">
        <p>
          En cas de rougeur persistante, de chaleur excessive ou de douleur anormale, n'attendez pas
          et contactez-moi ou votre médecin.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// No logic needed for this static informational page
</script>

<style scoped>
.prose ul li strong {
  color: #1a202c;
}
</style>
