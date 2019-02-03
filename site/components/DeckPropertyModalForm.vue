<template>
  <form @submit.prevent="_onSave">
    <div class="modal-card">
      <section class="modal-card-body">
        <BField :label="label">
          <BInput
            :value="propertyValue"
            :placeholder="placeholder"
            :type="type"
            :maxlength="maxlength"
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
    type: { type: String, default: 'text' },
    maxlength: { type: Number, default: null },
    onSave: { type: Function, default: null },
  },
  computed: {
    label() {
      const letters = this.propertyName.split('')
      return [letters[0].toUpperCase(), ...letters.slice(1)].join('')
    },
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
