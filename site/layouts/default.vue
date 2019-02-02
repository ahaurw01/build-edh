<template>
  <div>
    <nav class="navbar">
      <div class="navbar-brand">
        <h1 class="navbar-item title">
          BuildEDH
        </h1>
      </div>

      <div class="navbar-menu">
        <div class="navbar-end">
          <div class="navbar-item">
            <button v-show="isLoggedIn" class="button" @click="logOut">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
    <section class="section">
      <div class="container">
        <Nuxt />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  computed: {
    isLoggedIn() {
      return this.$auth.loggedIn
    },
  },
  methods: {
    logOut() {
      this.$auth.logout()
    },
  },
}
</script>
