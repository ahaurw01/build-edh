<template>
  <section>
    <h3 class="title is-3">
      {{ title }}
    </h3>
    <button
      v-for="card in commanders"
      :key="card.source.name"
      class="card-container-inner"
      @click="
        isCardShowcaseOpen = true
        cardToShowcase = card
      "
    >
      <Card
        :card="card.source"
        :count="card.count"
        :is-foil="card.isFoil"
        size="medium"
      />
    </button>

    <button
      v-if="canAddCommander"
      class="button is-primary"
      @click="isNewCommanderModalActive = true"
    >
      Add Commander
    </button>

    <BModal :active.sync="isNewCommanderModalActive" has-modal-card>
      <div class="modal-card tab-card" style="overflow: visible">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Add Commander
          </p>
        </header>
        <CardModalForm for-commander />
      </div>
    </BModal>

    <BModal :active.sync="isEditCommanderModalActive" has-modal-card>
      <div class="modal-card tab-card" style="overflow: visible">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Update Commander
          </p>
        </header>
        <CardModalForm for-commander :card="commanderToEdit" edit />
      </div>
    </BModal>

    <CardShowcaseModal
      :card="cardToShowcase"
      :is-open="isCardShowcaseOpen"
      show-edit-button
      @edit-card="editCommander(cardToShowcase)"
      @close="isCardShowcaseOpen = false"
    />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import Card from '~/components/Card'
import CardModalForm from '~/components/CardModalForm'
import CardShowcaseModal from '~/components/CardShowcaseModal'
export default {
  components: {
    Card,
    CardModalForm,
    CardShowcaseModal,
  },
  data() {
    return {
      isNewCommanderModalActive: false,
      isEditCommanderModalActive: false,
      commanderToEdit: null,
      isCardShowcaseOpen: false,
      cardToShowcase: null,
    }
  },

  computed: {
    title() {
      return this.commanders.length === 2 ? 'Commanders' : 'Commander'
    },
    ...mapGetters(
      ['commanders', 'canAddCommander'].reduce((acc, key) => {
        acc[key] = `deck/${key}`
        return acc
      }, {})
    ),
  },
  methods: {
    editCommander(commander) {
      this.commanderToEdit = commander
      this.isEditCommanderModalActive = true
    },
  },
}
</script>

<style scoped></style>
<style>
.card-showcase-modal .modal-content {
  max-height: unset;
}
</style>
