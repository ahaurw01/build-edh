<template>
  <div>
    <div class="has-text-centered">
      <BButton
        icon-left="discord"
        type="is-dark"
        size="is-medium"
        @click="discordLogin"
      >
        Continue with Discord
      </BButton>
    </div>
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

<style scoped>
button {
  background-color: #6b7dc0 !important;
}
</style>
