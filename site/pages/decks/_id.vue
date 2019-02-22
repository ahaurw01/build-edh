<template>
  <section>
    <div class="columns is-vcentered">
      <div class="column">
        <h2 class="title is-2">
          {{ name }}
        </h2>
      </div>
      <div class="column is-1">
        <button class="button" @click="isEditNameModalActive = true">
          <BIcon icon="pencil" />
        </button>
      </div>
    </div>

    <div class="columns is-vcentered">
      <div class="column">
        <h4 class="subtitle is-4">
          {{ purpose }}
        </h4>
      </div>
      <div class="column is-1">
        <button class="button" @click="isEditPurposeModalActive = true">
          <BIcon icon="pencil" />
        </button>
      </div>
    </div>

    <div class="columns is-vcentered">
      <div class="column">
        <p
          v-for="(paragraph, index) in descriptionParagraphs"
          :key="index"
          class="description-paragraph"
        >
          {{ paragraph }}
        </p>
      </div>
      <div class="column is-1">
        <button class="button" @click="isEditDescriptionModalActive = true">
          <BIcon icon="pencil" />
        </button>
      </div>
    </div>

    <CommanderSection />

    <BModal :active.sync="isEditNameModalActive" has-modal-card>
      <DeckPropertyModalForm property="name" />
    </BModal>
    <BModal :active.sync="isEditPurposeModalActive" has-modal-card>
      <DeckPropertyModalForm
        property="purpose"
        type="textarea"
        :maxlength="200"
      />
    </BModal>
    <BModal :active.sync="isEditDescriptionModalActive" has-modal-card>
      <DeckPropertyModalForm property="description" type="textarea" />
    </BModal>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import DeckPropertyModalForm from '~/components/DeckPropertyModalForm'
import CommanderSection from '~/components/CommanderSection'
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
    CommanderSection,
  },
  data: () => ({
    isEditNameModalActive: false,
    isEditPurposeModalActive: false,
    isEditDescriptionModalActive: false,
  }),
  computed: {
    ...mapGetters({
      ownerUsername: 'deck/ownerUsername',
      name: 'deck/name',
      purpose: 'deck/purpose',
      description: 'deck/description',
      descriptionParagraphs: 'deck/descriptionParagraphs',
    }),
  },
}
</script>

<style scoped>
.description-paragraph {
  margin-bottom: 1em;
}
</style>
