<template>
  <section>
    <div class="columns is-vcentered">
      <div class="column">
        <h2 class="title is-2">{{ name }}</h2>
      </div>
      <div class="column is-1">
        <button class="button" @click="isEditNameModalActive = true">
          <BIcon icon="pencil" />
        </button>
      </div>
    </div>

    <div class="columns is-vcentered">
      <div class="column">
        <h4 class="subtitle is-4">{{ purpose }}</h4>
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
    <NinetyNineSection />

    <div class="columns is-vcentered">
      <div class="column">
        <button class="button" @click="isBulkAddModalActive = true">
          Bulk input
        </button>
      </div>
    </div>

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
    <BModal
      :active.sync="isBulkAddModalActive"
      has-modal-card
      @close="resetBulkAddErrorMessages"
    >
      <BulkAddModalForm />
    </BModal>

    <button class="sidebar-opener" @click="isMobileSidebarOpen = true">
      <BIcon icon="book-open" size="is-medium" />
    </button>

    <DeckSidebar :is-open="isMobileSidebarOpen" />
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import DeckPropertyModalForm from '~/components/DeckPropertyModalForm'
import CommanderSection from '~/components/CommanderSection'
import NinetyNineSection from '~/components/NinetyNineSection'
import BulkAddModalForm from '~/components/BulkAddModalForm'
import DeckSidebar from '~/components/DeckSidebar'
export default {
  components: {
    DeckPropertyModalForm,
    CommanderSection,
    NinetyNineSection,
    BulkAddModalForm,
    DeckSidebar,
  },

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

  data: () => ({
    isEditNameModalActive: false,
    isEditPurposeModalActive: false,
    isEditDescriptionModalActive: false,
    isBulkAddModalActive: false,
    isMobileSidebarOpen: false,
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

  methods: {
    ...mapActions({
      resetBulkAddErrorMessages: 'deck/resetBulkAddErrorMessages',
    }),
  },
}
</script>

<style scoped>
.description-paragraph {
  margin-bottom: 1em;
}

.sidebar-opener {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: inline-block;
  padding: 1rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.25);
  box-shadow: 0.05rem 0.1rem 0.1rem 0 rgba(0, 0, 0, 0.5);
}
</style>
