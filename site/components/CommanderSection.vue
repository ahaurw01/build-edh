<template>
  <section>
    <BModal :active.sync="isEditCommanderModalActive" has-modal-card>
      <div class="modal-card tab-card" style="overflow: visible">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Update Commander
          </p>
        </header>
        <CardModalForm only-for-commander :card="commanderToEdit" edit />
      </div>
    </BModal>

    <CardSection
      :title="title"
      :cards="commanders"
      no-special-shadow
      @edit-card="editCommander"
    />

    <BNotification
      v-if="commanders.length === 0"
      :closable="false"
      type="is-light"
      message="No commander added yet"
    />
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
      isEditCommanderModalActive: false,
      commanderToEdit: null,
    }
  },

  computed: {
    title() {
      return this.commanders.length === 2 ? 'Commanders' : 'Commander'
    },

    ...mapGetters({
      commanders: 'deck/commanders',
    }),
  },
  methods: {
    editCommander(commander) {
      this.commanderToEdit = commander
      this.isEditCommanderModalActive = true
    },
  },
}
</script>
