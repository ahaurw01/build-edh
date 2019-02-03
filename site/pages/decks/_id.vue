<template>
  <section>
    <h2 class="title is-2">
      <span>{{ deckName }} by {{ ownerUsername }}</span>
    </h2>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  async fetch({ store, params, error, $axios }) {
    try {
      const { data: deck } = await $axios.get(`/api/decks/${params.id}`)
      const { data: owner } = await $axios.get(`/api/users/${deck.owner}`)
      store.commit('deck/deck', deck)
      store.commit('deck/owner', owner)
    } catch (e) {
      error({ statusCode: 404, message: 'Deck not found' })
    }
  },
  computed: {
    ...mapGetters({
      ownerUsername: 'deck/ownerUsername',
      deckName: 'deck/deckName',
    }),
  },
  methods: {
    ...mapActions([]),
  },
}
</script>

<style></style>
