<template>
  <section class="section">
    <p>{{ name }}</p>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  auth: false,

  components: {},

  async fetch({ store, params, error, $axios }) {
    try {
      const { data: deck } = await $axios.get(`/api/decks/${params.id}`)
      store.commit('playtest/deck', deck)
    } catch (e) {
      error({ statusCode: 404, message: 'Deck not found' })
    }
  },

  data: () => ({}),

  computed: {
    ...mapGetters({
      name: 'playtest/name',
    }),
  },

  methods: {},
}
</script>

<style scoped></style>
