<template>
  <section>
    <h3 class="title is-3">
      Commander
    </h3>
    <Card
      v-for="commander in commanders"
      :key="commander.source.name"
      :card="commander.source"
      size="large"
      @click="isEditCommanderModalActive = true"
    />
    <button
      v-if="canAddCommander"
      class="button is-primary"
      @click="isNewCommanderModalActive = true"
    >
      Add Commander
    </button>

    <BModal :active.sync="isNewCommanderModalActive" has-modal-card>
      <CommanderModalForm :on-save="onSaveNewCommander" />
    </BModal>

    <BModal :active.sync="isEditCommanderModalActive" has-modal-card>
      <CommanderModalForm :on-save="onSaveNewCommander" />
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
    }
  },

  computed: {
    ...mapGetters(
      ['commanders', 'canAddCommander'].reduce((acc, key) => {
        acc[key] = `deck/${key}`
        return acc
      }, {})
    ),
  },

  methods: {
    onSaveNewCommander(commander) {},
  },
}
</script>

<style scoped></style>
