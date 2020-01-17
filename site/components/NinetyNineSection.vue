<template>
  <section>
    <h3 class="title is-3">
      The Deck
    </h3>
    <BButton
      v-if="canAddCard"
      type="is-primary"
      size="is-large"
      @click="isNewCardModalActive = true"
    >
      Add Card(s)
    </BButton>

    <CardSection
      v-for="grouping in cardGroupings"
      :key="grouping.purpose"
      :title="grouping.purpose"
      :is-auto="grouping.isAutomaticGroup"
      :is-compu="grouping.isCompuPurposeGroup"
      :cards="grouping.cards"
      @edit-card="editCard"
    />

    <BModal
      :active.sync="isNewCardModalActive"
      has-modal-card
      @close="resetBulkAddErrorMessages"
    >
      <AddSingleOrBulkModal />
    </BModal>

    <BModal :active.sync="isEditCardModalActive" has-modal-card>
      <div class="modal-card" style="overflow: visible">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Edit Card
          </p>
        </header>
        <CardModalForm :card="cardToEdit" edit />
      </div>
    </BModal>
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CardSection from '~/components/CardSection'
import AddSingleOrBulkModal from '~/components/AddSingleOrBulkModal'
import CardModalForm from '~/components/CardModalForm'
export default {
  components: {
    AddSingleOrBulkModal,
    CardSection,
    CardModalForm,
  },
  data() {
    return {
      isNewCardModalActive: false,
      isEditCardModalActive: false,
      cardToEdit: null,
    }
  },

  computed: {
    ...mapGetters(
      ['canAddCard', 'cardGroupings'].reduce((acc, key) => {
        acc[key] = `deck/${key}`
        return acc
      }, {})
    ),
  },
  methods: {
    ...mapActions({
      resetBulkAddErrorMessages: 'deck/resetBulkAddErrorMessages',
    }),

    editCard(card) {
      this.cardToEdit = card
      this.isEditCardModalActive = true
    },
  },
}
</script>

<style scoped></style>
