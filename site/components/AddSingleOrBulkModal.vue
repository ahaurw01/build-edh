<template>
  <div class="modal-card tab-card" style="overflow: visible">
    <header class="modal-card-head">
      <p class="modal-card-title">
        Add Card(s)
      </p>
    </header>
    <BTabs>
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
import CardModalForm from './CardModalForm'
import BulkAddModalForm from './BulkAddModalForm'

export default {
  components: {
    CardModalForm,
    BulkAddModalForm,
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
