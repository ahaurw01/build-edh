<template>
  <section class="section">
    <div class="container">
      <LandingHero />
      <h1 class="title is-2 has-text-centered">
        Build purposeful EDH decks.
      </h1>
      <SignIn />
    </div>
  </section>
</template>

<script>
import LandingHero from '~/components/LandingHero.vue'
import SignIn from '~/components/SignIn.vue'

export default {
  components: {
    LandingHero,
    SignIn,
  },
}
</script>

<style></style>
