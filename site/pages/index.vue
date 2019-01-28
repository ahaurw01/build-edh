<template>
  <div>
    <LandingHero />
    <h1 class="tagline">
      Build purposeful EDH decks.
    </h1>
    <SignIn />
  </div>
</template>

<script>
import LandingHero from '~/components/LandingHero.vue'
import SignIn from '~/components/SignIn.vue'

export default {
  components: {
    LandingHero,
    SignIn
  },
  head() {
    return {
      meta: [
        {
          hid: 'theme-color',
          name: 'theme-color',
          content: '#343944'
        }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://use.fontawesome.com/releases/v5.6.3/css/all.css',
          integrity:
            'sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/',
          crossorigin: 'anonymous'
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
