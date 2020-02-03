<template>
  <section class="deck-section section">
    <div class="container is-fullhd">
      <div class="columns deck-page-columns">
        <div class="deck-view column">
          <div class="columns is-vcentered">
            <div class="column">
              <h2 class="title is-2">
                {{ name }}
                <p class="title is-6 owner has-text-grey">
                  by
                  <NuxtLink :to="`/decks/${owner._id}`">{{
                    owner.username
                  }}</NuxtLink>
                </p>
              </h2>
            </div>
            <div v-if="iAmOwner" class="column is-narrow">
              <button class="button" @click="isEditNameModalActive = true">
                <BIcon icon="pencil" />
              </button>
            </div>
          </div>

          <div class="columns is-vcentered">
            <div class="column">
              <h4 class="subtitle is-4">{{ purpose }}</h4>
            </div>
            <div v-if="iAmOwner" class="column is-narrow">
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
            <div v-if="iAmOwner" class="column is-narrow">
              <button
                class="button"
                @click="isEditDescriptionModalActive = true"
              >
                <BIcon icon="pencil" />
              </button>
            </div>
          </div>

          <CommanderSection />
          <NinetyNineSection />

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
            :active.sync="isNewCardModalActive"
            has-modal-card
            @close="resetBulkAddErrorMessages"
          >
            <AddSingleOrBulkModal />
          </BModal>

          <BButton
            v-if="iAmOwner"
            size="is-medium"
            icon-left="plus"
            type="is-info"
            class="new-card-modal-opener"
            :class="{ 'call-to-action': numCards === 0 }"
            @click="isNewCardModalActive = true"
          />
          <BButton
            size="is-medium"
            icon-left="book-open"
            type="is-primary"
            class="sidebar-opener"
            @click="isMobileSidebarOpen = true"
          />
        </div>
        <div class="separator" />
        <DeckSidebar
          :is-open="isMobileSidebarOpen"
          @close="isMobileSidebarOpen = false"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import DeckPropertyModalForm from '~/components/DeckPropertyModalForm'
import CommanderSection from '~/components/CommanderSection'
import NinetyNineSection from '~/components/NinetyNineSection'
import DeckSidebar from '~/components/DeckSidebar'
import AddSingleOrBulkModal from '~/components/AddSingleOrBulkModal'
import Presser from '~/components/Presser'

export default {
  auth: false,

  components: {
    DeckPropertyModalForm,
    CommanderSection,
    NinetyNineSection,
    DeckSidebar,
    AddSingleOrBulkModal,
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
    isMobileSidebarOpen: false,
    isNewCardModalActive: false,
  }),

  computed: {
    ...mapGetters({
      owner: 'deck/owner',
      name: 'deck/name',
      purpose: 'deck/purpose',
      description: 'deck/description',
      descriptionParagraphs: 'deck/descriptionParagraphs',
      numCards: 'deck/numCards',
      iAmOwner: 'deck/iAmOwner',
    }),
  },

  mounted() {
    this.presser = new Presser()
    this.presser.on('addCard', () => {
      if (this.iAmOwner) {
        this.isNewCardModalActive = true
      }
    })

    this.getPricesForDeck()
  },

  beforeDestroy() {
    this.presser.off('addCard')
  },

  methods: {
    ...mapActions({
      resetBulkAddErrorMessages: 'deck/resetBulkAddErrorMessages',
      getPricesForDeck: 'deck/getPricesForDeck',
    }),
  },
}
</script>

<style scoped>
.deck-page-columns {
  margin-top: 0;
  margin-bottom: 0;
}

.deck-section {
  display: flex;
  flex: 1;
  padding-top: 0;
  padding-bottom: 0;
}

@media (min-width: 769px) {
  .deck-view {
    flex: 1;
    max-height: calc(100vh - 52px);
    overflow: auto;
  }
}

.separator {
  display: none;
  width: 2px;
  height: calc(100vh - 52px - 2rem);
  margin: 1rem 2px;
  background: whitesmoke;
}

@media (min-width: 769px) {
  .separator {
    display: block;
  }
}

.owner {
  margin-top: 0.5rem;
  margin-left: 1rem;
}

.description-paragraph {
  margin-bottom: 1em;
}

.sidebar-opener {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}

.new-card-modal-opener {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
}

.call-to-action {
  animation: 4s ease point-it-out infinite;
}

@media (min-width: 769px) {
  .sidebar-opener {
    display: none;
  }
}

@keyframes point-it-out {
  80% {
    transform: scale(1);
  }

  85% {
    transform: scale(1.25);
  }

  90% {
    transform: scale(1);
  }

  95% {
    transform: scale(1.25);
  }

  100% {
    transform: scale(1);
  }
}
</style>
