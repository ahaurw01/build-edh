<template>
  <form @submit.prevent="_onSave">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add a commander
        </p>
      </header>
      <section class="modal-card-body">
        <BField label="Commander">
          <BInput />
        </BField>
      </section>
      <footer class="modal-card-foot">
        <button class="button" type="button" @click="$parent.close()">
          Cancel
        </button>
        <button class="button is-primary">
          Add
        </button>
      </footer>
    </div>
  </form>
</template>

<script>
export default {
  props: {
    commander: { type: Object, default: null },
    onSave: { type: Function, required: true },
  },
  methods: {
    _onSave(e) {
      this.$parent.close()
    },
  },
}
</script>
