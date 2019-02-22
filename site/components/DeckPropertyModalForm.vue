<template>
  <form @submit.prevent="onSave">
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
import { mapActions, mapGetters } from 'vuex'
export default {
  props: {
    property: { type: String, default: null },
    placeholder: { type: String, default: null },
    type: { type: String, default: 'text' },
    maxlength: { type: Number, default: null },
  },
  computed: {
    label() {
      const letters = this.property.split('')
      return [letters[0].toUpperCase(), ...letters.slice(1)].join('')
    },
    ...mapGetters({
      name: 'deck/name',
      purpose: 'deck/purpose',
      description: 'deck/description',
    }),
    propertyValue() {
      return this[this.property]
    },
  },
  methods: {
    onSave(e) {
      const saver = this[`update${this.label}`]
      saver(new FormData(e.target).get('property')).then(() => {
        this.$parent.close()
      })
    },
    ...mapActions({
      updateName: 'deck/updateName',
      updatePurpose: 'deck/updatePurpose',
      updateDescription: 'deck/updateDescription',
    }),
  },
}
</script>
