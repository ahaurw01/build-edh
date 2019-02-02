<template>
  <section>
    <h2 class="title is-2">
      My decks
    </h2>

    <div class="has-text-centered">
      <button class="button is-large is-primary" @click="createDeck">
        <BIcon icon="plus" />
        <span>
          Create New Deck
        </span>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  computed: {},
  methods: {
    async createDeck() {
      const { data: deck } = await this.$axios.post('/api/decks')
      this.$router.push(`/decks/${deck._id}`)
    },
  },
}
</script>

<style></style>
