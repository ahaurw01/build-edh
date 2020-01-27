<template>
  <div class="main">
    <BNavbar shadow>
      <template slot="brand">
        <BNavbarItem tag="NuxtLink" to="/">
          <h1 class="title">
            EDHlist
          </h1>
        </BNavbarItem>
      </template>
      <template slot="end">
        <BNavbarItem tag="div">
          <BButton v-show="isLoggedIn" @click="logOut">
            Log Out
          </BButton>
        </BNavbarItem>
      </template>
    </BNavbar>

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
