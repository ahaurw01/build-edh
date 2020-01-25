<template>
  <section class="section">
    <div class="container">
      <h2 class="title is-2">{{ user.username }}'s decks</h2>

      <div v-if="userIsMe" class="section has-text-centered">
        <BButton
          size="is-large"
          type="is-primary"
          icon-left="plus"
          @click="createDeck"
        >
          Create New Deck
        </BButton>
      </div>

      <section class="section">
        <div v-if="decks.length" class="columns is-multiline">
          <div v-for="deck in decks" :key="deck._id" class="column is-half">
            <NuxtLink :to="`/deck/${deck._id}`">
              <DeckTile :deck="deck" />
            </NuxtLink>
          </div>
        </div>

        <div v-else>
          <BNotification :closable="false" message="No decks just yet." />
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import DeckTile from '~/components/DeckTile'

export default {
  auth: false,

  components: {
    DeckTile,
  },

  async fetch({ store, params, $axios, error }) {
    try {
      const { data: user } = await $axios.get(`/api/users/${params.username}`)
      const { data: decks } = await $axios.get(`/api/decks?ownerId=${user._id}`)
      store.commit('decks/user', user)
      store.commit('decks/decks', decks)
    } catch (e) {
      error({ statusCode: 404, message: 'User not found' })
    }
  },

  computed: {
    ...mapGetters({
      decks: 'decks/decks',
      user: 'decks/user',
      userIsMe: 'decks/userIsMe',
    }),
  },

  methods: {
    async createDeck() {
      const { data: deck } = await this.$axios.post('/api/decks')
      this.$router.push(`/deck/${deck._id}`)
    },
  },
}
</script>

<style></style>
