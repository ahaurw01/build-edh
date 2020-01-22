<template>
  <section>
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

    <CardSection
      :title="title"
      :cards="commanders"
      no-special-shadow
      @edit-card="editCommander"
    />

    <button
      v-if="canAddCommander"
      class="button is-primary"
      @click="isNewCommanderModalActive = true"
    >
      Add Commander
    </button>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import CardSection from '~/components/CardSection'
import CardModalForm from '~/components/CardModalForm'
import CardShowcaseModal from '~/components/CardShowcaseModal'
export default {
  components: {
    CardSection,
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
