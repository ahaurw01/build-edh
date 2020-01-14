<template>
  <section>
    <h3 class="title is-3">
      {{ title }}
    </h3>
    <button
      v-if="canAddCard"
      class="button is-primary is-large"
      @click="isNewCardModalActive = true"
    >
      Add Card
    </button>

    <CardSection
      v-for="grouping in cardGroupings"
      :key="grouping.purpose"
      :title="grouping.purpose"
      :is-auto="grouping.isAutomaticGroup"
      :is-compu="grouping.isCompuPurposeGroup"
      :cards="grouping.cards"
      @edit-card="editCard"
    />

    <BModal :active.sync="isNewCardModalActive" has-modal-card>
      <CardModalForm />
    </BModal>

    <BModal :active.sync="isEditCardModalActive" has-modal-card>
      <CardModalForm :card="cardToEdit" edit />
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
      isNewCardModalActive: false,
      isEditCardModalActive: false,
      cardToEdit: null,
    }
  },

  computed: {
    title() {
      return this.commanders.length === 2 ? 'The 98' : 'The 99'
    },
    ...mapGetters(
      ['commanders', 'the99', 'canAddCard', 'cardGroupings'].reduce(
        (acc, key) => {
          acc[key] = `deck/${key}`
          return acc
        },
        {}
      )
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

<style scoped></style>
