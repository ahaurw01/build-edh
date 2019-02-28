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
    <Card
      v-for="card in the99"
      :key="card.source.name"
      :card="card.source"
      size="medium"
      @click.prevent="editCommander(card)"
    />

    <BModal :active.sync="isNewCardModalActive" has-modal-card>
      <CardModalForm />
    </BModal>

    <BModal :active.sync="isEditCardModalActive" has-modal-card>
      <CardModalForm :commander="cardToEdit" edit />
    </BModal>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import Card from '~/components/Card'
import CardModalForm from '~/components/CardModalForm'
export default {
  components: {
    Card,
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
      ['commanders', 'the99', 'canAddCard'].reduce((acc, key) => {
        acc[key] = `deck/${key}`
        return acc
      }, {})
    ),
  },
  methods: {},
}
</script>

<style scoped></style>
