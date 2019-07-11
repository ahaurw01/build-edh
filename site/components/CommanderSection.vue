<template>
  <section>
    <h3 class="title is-3">
      {{ title }}
    </h3>
    <Card
      v-for="commander in commanders"
      :key="commander.source.name"
      :card="commander.source"
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
      <CommanderModalForm />
    </BModal>

    <BModal :active.sync="isEditCommanderModalActive" has-modal-card>
      <CommanderModalForm :commander="commanderToEdit" edit />
    </BModal>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import Card from '~/components/Card'
import CommanderModalForm from '~/components/CommanderModalForm'
export default {
  components: {
    Card,
    CommanderModalForm,
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
