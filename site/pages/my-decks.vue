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
    createDeck() {
      this.$axios.post('/api/decks').then(({ data }) => {
        this.$router.push(`/decks/${data._id}`)
      })
    },
  },
}
</script>

<style></style>
