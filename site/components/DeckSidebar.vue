<template>
  <div class="deck-sidebar column is-narrow" :class="{ 'is-open': isOpen }">
    <BButton
      icon-left="close-circle-outline"
      size="is-medium"
      type="is-dark"
      class="close-button"
      @click="$emit('close')"
    />

    <div class="box deck-sidebar-content">
      <h3 class="title is-3 ">Settings</h3>
      <BSwitch :value="usePurposeGroups" @input="setUsePurposeGroups">
        Group by <b>{{ usePurposeGroups ? 'purposes' : 'card type' }}</b>
      </BSwitch>
      <br />
      <BSwitch :value="sortByCmc" @input="setSortByCmc">
        Sort by <b>{{ sortByCmc ? 'cmc' : 'card name' }}</b>
      </BSwitch>

      <hr />

      <h3 class="title is-3">Stats</h3>
      <DeckStats />

      <hr />

      <h3 class="title is-3">Computed Purposes</h3>
      <CompuPurposes
        :compu-purposes="compuPurposes"
        @change="updateCompuPurposes"
      />

      <hr />

      <BButton @click="isExportModalOpen = true">View as text</BButton>

      <BButton v-if="iAmOwner" type="is-danger" @click="confirmDelete">
        Delete this deck
      </BButton>
    </div>

    <BModal :active.sync="isExportModalOpen" has-modal-card>
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Text Export</p>
        </header>
        <section class="modal-card-body">
          <textarea v-model="textExport" readonly rows="10" class="textarea" />
        </section>
        <footer class="modal-card-foot">
          <BButton @click="isExportModalOpen = false">
            Close
          </BButton>
          <BButton type="is-info" @click="copyText">
            Copy all to clipboard
          </BButton>
        </footer>
      </div>
    </BModal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ToastProgrammatic as Toast } from 'buefy'
import DeckStats from './DeckStats'
import CompuPurposes from './CompuPurposes'

export default {
  components: { DeckStats, CompuPurposes },
  props: {
    isOpen: { type: Boolean, required: true },
  },

  data() {
    return {
      isExportModalOpen: false,
    }
  },

  computed: {
    ...mapGetters({
      usePurposeGroups: 'deck/usePurposeGroups',
      sortByCmc: 'deck/sortByCmc',
      compuPurposes: 'deck/compuPurposes',
      textExport: 'deck/textExport',
      iAmOwner: 'deck/iAmOwner',
    }),
  },

  methods: {
    ...mapActions({
      setUsePurposeGroups: 'deck/setUsePurposeGroups',
      setSortByCmc: 'deck/setSortByCmc',
      updateCompuPurposes: 'deck/updateCompuPurposes',
      deleteDeck: 'deck/deleteDeck',
    }),

    copyText() {
      const el = document.createElement('textarea')
      el.value = this.textExport
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)

      Toast.open({
        message: '<i class="mdi mdi-check"></i> Copied',
        position: 'is-bottom',
        type: 'is-info',
      })
    },

    confirmDelete() {
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to delete this deck?',
        onConfirm: () => this.reallyConfirmDelete(),
      })
    },

    reallyConfirmDelete() {
      this.$buefy.dialog.confirm({
        message: 'ARE YOU REALLY SURE YOU WANT TO DELETE THIS DECK????',
        onConfirm: async () => {
          await this.deleteDeck()
          this.$router.push({
            path: '/my-decks',
          })
        },
      })
    },
  },
}
</script>

<style scoped>
.deck-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  transform: translateX(calc(100% + 1rem));
  transition: transform 200ms;
  z-index: 30;
  width: auto;
  min-width: 50%;
  height: 100vh;
  padding: 1rem;
  overflow: auto;
}

.is-open {
  /* Used for opening/closing on mobile. */
  transform: none;
}

.close-button {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1;
}

@media (max-width: 768px) {
  .deck-sidebar-content {
    box-shadow: 0 0 8px 8px rgba(0, 0, 0, 0.25);
  }
}

@media (min-width: 769px) {
  .close-button {
    display: none;
  }

  .deck-sidebar {
    position: static;
    transform: none;
    width: auto;
    min-width: auto;
    max-height: calc(100vh - 52px);
    overflow: auto;
  }

  .deck-sidebar-content {
    padding: 0.5rem 0;
    box-shadow: none;
  }
}

.textarea {
  width: calc(100vw - 50px);
}
</style>
