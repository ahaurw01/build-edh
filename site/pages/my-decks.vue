<template>
  <section>
    <h2 class="title is-2">
      My decks
    </h2>
    <section class="tile is-ancestor">
      <div class="tile is-vertical is-parent">
        <div v-for="deck in decks" :key="deck._id" class="tile is-child ">
          <DeckTile :deck="deck" />
        </div>
      </div>
    </section>

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
import { mapGetters } from 'vuex'
import DeckTile from '~/components/DeckTile'

export default {
  async fetch({ store, $axios }) {
    const { data: decks } = await $axios.get(`/api/decks/mine`)
    store.commit('decks/decks', decks)
  },

  components: {
    DeckTile,
  },

  computed: {
    ...mapGetters({ decks: 'decks/decks' }),
  },
  methods: {
    async createDeck() {
      const { data: deck } = await this.$axios.post('/api/decks')
      this.$router.push(`/decks/${deck._id}`)
    },
  },
}
</script>

<style></style>
