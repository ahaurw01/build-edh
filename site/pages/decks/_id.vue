<template>
  <section>
    <h2 class="title is-2">
      <span>{{ name }}</span>
      <span>
        <button class="button" @click="isEditNameModalActive = true">
          <BIcon icon="pencil" />
        </button>
      </span>
    </h2>
    <h4 class="subtitle is-4">
      <span>{{ purpose }}</span>
      <span>
        <button class="button" @click="isEditPurposeModalActive = true">
          <BIcon icon="pencil" />
        </button>
      </span>
    </h4>
    <BModal :active.sync="isEditNameModalActive" has-modal-card>
      <DeckPropertyModalForm
        property-name="name"
        :property-value="name"
        :on-save="updateName"
      />
    </BModal>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DeckPropertyModalForm from '~/components/DeckPropertyModalForm'
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
  components: {
    DeckPropertyModalForm,
  },
  data: () => ({
    isEditNameModalActive: false,
    isEditPurposeModalActive: false,
  }),
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
