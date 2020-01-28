<template>
  <div>
    <h4 class="subtitle is-4 has-text-centered">
      Register or log in to get started.
    </h4>
    <BButton @click="discordLogin">Continue with Discord</BButton>
  </div>
</template>

<script>
export default {
  methods: {
    discordLogin() {
      this.$auth.loginWith('discord', { params: { prompt: 'none' } })
    },
  },
}
</script>
