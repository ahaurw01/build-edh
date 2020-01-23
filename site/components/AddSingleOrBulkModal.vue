<template>
  <div class="modal-card tab-card" style="overflow: visible">
    <header class="modal-card-head">
      <p class="modal-card-title">
        Add Card(s)
      </p>
    </header>
    <BTabs :value="selectedTabIndex" @input="userSelectedTabIndex = $event">
      <BTabItem v-if="canAddCommander" label="Add Commander">
        <CardModalForm only-for-commander />
      </BTabItem>
      <BTabItem label="Add Single Card">
        <CardModalForm />
      </BTabItem>
      <BTabItem label="Bulk Add Cards">
        <BulkAddModalForm />
      </BTabItem>
    </BTabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CardModalForm from './CardModalForm'
import BulkAddModalForm from './BulkAddModalForm'

export default {
  components: {
    CardModalForm,
    BulkAddModalForm,
  },

  data() {
    return {
      userSelectedTabIndex: null,
    }
  },

  computed: {
    ...mapGetters({
      canAddCommander: 'deck/canAddCommander',
      commanders: 'deck/commanders',
    }),

    selectedTabIndex() {
      if (this.userSelectedTabIndex !== null) {
        return this.userSelectedTabIndex
      }

      if (!this.canAddCommander || !this.commanders.length) {
        return 0
      }

      return 1
    },
  },
}
</script>

<style>
.tab-card .tab-content {
  padding: 0;
}

.tab-card nav.tabs ul {
  background: white;
}
</style>
