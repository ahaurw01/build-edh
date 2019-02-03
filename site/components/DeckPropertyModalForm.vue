<template>
  <form @submit.prevent="_onSave">
    <div class="modal-card">
      <section class="modal-card-body">
        <BField :label="propertyName">
          <BInput
            :value="propertyValue"
            :placeholder="placeholder"
            name="property"
          />
        </BField>
      </section>
      <footer class="modal-card-foot">
        <button class="button" type="button" @click="$parent.close()">
          Cancel
        </button>
        <button class="button is-primary">
          Save
        </button>
      </footer>
    </div>
  </form>
</template>

<script>
export default {
  props: {
    propertyName: { type: String, default: null },
    propertyValue: { type: String, default: null },
    placeholder: { type: String, default: null },
    onSave: { type: Function, default: null },
  },
  methods: {
    _onSave(e) {
      this.onSave(new FormData(e.target).get('property')).then(() => {
        this.$parent.close()
      })
    },
  },
}
</script>
