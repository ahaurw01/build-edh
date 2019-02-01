<template>
  <div>
    <h4 class="subtitle is-4 has-text-centered">
      Sign in to get started.
    </h4>
    <div class="buttons signin-buttons">
      <button class="button is-fullwidth is-medium" @click="onGoogleClick">
        <BIcon icon="google" />
        <span>Google</span>
      </button>
      <button class="button is-fullwidth is-medium">
        <BIcon icon="facebook" />
        <span>Facebook</span>
      </button>
      <button class="button is-fullwidth is-medium">
        <BIcon icon="twitter" />
        <span>Twitter</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    onGoogleClick() {
      this.$auth.loginWith('google')
    }
  }
}
</script>

<style scoped>
.signin-buttons {
  max-width: 300px;
  margin: auto;
}

button :last-child {
  flex: 1;
}
</style>
