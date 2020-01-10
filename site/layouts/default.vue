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
    <!-- <section class="section main-content">
      <div class="container">
        
      </div>
    </section> -->
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
    logOut() {
      this.$auth.logout()
    },
    hitBurger() {
      this.burgerActive = !this.burgerActive
    },
  },
}
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
}
</style>
