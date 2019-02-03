<template>
  <section>
    <h2 class="title is-2">
      <span>{{ name }} by {{ ownerUsername }}</span>
      <BField label="Name">
        <BInput :value="name" placeholder="Untitled" @input="updateName" />
      </BField>
      <BField label="Purpose">
        <BInput
          :value="purpose"
          placeholder="What is this deck's goal?"
          @input="updatePurpose"
        />
      </BField>
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
      name: 'deck/name',
      purpose: 'deck/purpose',
    }),
  },
  methods: {
    ...mapActions({
      updateName: 'deck/updateName',
      updatePurpose: 'deck/updatePurpose',
    }),
  },
}
</script>

<style></style>
