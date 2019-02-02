<template>
  <div>
    <h1>{{ name }}'s decks</h1>
  </div>
</template>

<script>
export default {
  computed: {
    name() {
      return this.$auth.user.given_name
    },
  },
}
</script>

<style></style>
