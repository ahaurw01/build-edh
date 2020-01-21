<template>
  <section>
    <h3 class="title is-3">
      {{ title }}
    </h3>
    <Card
      v-for="commander in commanders"
      :key="commander.source.name"
      :card="commander.source"
      :is-foil="commander.isFoil"
      size="large"
      show-edit-button
      @edit-card="editCommander(commander)"
    />
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
      isNewCommanderModalActive: false,
      isEditCommanderModalActive: false,
      commanderToEdit: null,
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
