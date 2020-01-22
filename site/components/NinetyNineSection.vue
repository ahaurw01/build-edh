<template>
  <section>
    <CardSection
      v-for="grouping in cardGroupings"
      :key="grouping.purpose"
      :title="grouping.purpose"
      :is-auto="grouping.isAutomaticGroup"
      :is-compu="grouping.isCompuPurposeGroup"
      :cards="grouping.cards"
      show-icon
      show-total
      @edit-card="editCard"
    />

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
import { mapGetters } from 'vuex'
import CardSection from '~/components/CardSection'
import CardModalForm from '~/components/CardModalForm'
export default {
  components: {
    CardSection,
    CardModalForm,
  },
  data() {
    return {
      isEditCardModalActive: false,
      cardToEdit: null,
    }
  },

  computed: {
    ...mapGetters(
      ['cardGroupings'].reduce((acc, key) => {
        acc[key] = `deck/${key}`
        return acc
      }, {})
    ),
  },
  methods: {
    editCard(card) {
      this.cardToEdit = card
      this.isEditCardModalActive = true
    },
  },
}
</script>
