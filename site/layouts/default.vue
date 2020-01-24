<template>
  <div class="main">
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="navbar-item">
          <h1 class="title">
            BuildEDH
          </h1>
        </div>
        <a
          role="button"
          class="navbar-burger"
          :class="{ 'is-active': burgerActive }"
          aria-label="menu"
          :aria-expanded="burgerActive"
          @click="hitBurger"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': burgerActive }">
        <div class="navbar-end">
          <div class="navbar-item">
            <button v-show="isLoggedIn" class="button" @click="logOut">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
    <Nuxt />
  </div>
</template>

<script>
export default {
  data() {
    return { burgerActive: false }
  },

  computed: {
    isLoggedIn() {
      return this.$auth.loggedIn
    },
  },

  methods: {
    async logOut() {
      await this.$auth.logout()
      window.location = '/'
    },
    hitBurger() {
      this.burgerActive = !this.burgerActive
    },
  },

  head() {
    return {
      link: [
        {
          href: '//cdn.jsdelivr.net/npm/mana-font@1.4.1/css/mana.min.css',
          rel: 'stylesheet',
          type: 'text/css',
        },
      ],
    }
  },
}
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
}
</style>
