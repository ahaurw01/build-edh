<template>
  <div>
    <LandingHero />
    <h1 class="tagline">Build purposeful EDH decks.</h1>
  </div>
</template>

<script>
import LandingHero from '~/components/LandingHero.vue'

export default {
  components: {
    LandingHero
  },
  head() {
    return {
      meta: [
        {
          hid: 'theme-color',
          name: 'theme-color',
          content: '#343944'
        }
      ]
    }
  }
}
</script>

<style>
.tagline {
  text-align: center;
}
</style>
