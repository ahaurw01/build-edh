<template>
  <div class="main">
    <BNavbar shadow :mobile-burger="false">
      <template slot="brand">
        <BNavbarItem tag="NuxtLink" to="/">
          <h1 class="title">
            <span>edh</span><span class="has-text-grey">list</span>
          </h1>
        </BNavbarItem>
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
<style>
.navbar-brand {
  justify-content: space-between;
}
</style>
