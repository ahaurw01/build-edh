<template>
  <form ref="form" @submit.prevent="onSave">
    <div class="modal-card" style="overflow: visible">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Bulk Input
        </p>
      </header>
      <section class="modal-card-body" style="overflow: visible">
        <BField :type="{ 'is-danger': hasErrors }" :message="fieldMessages">
          <BInput
            v-model="bulkInput"
            type="textarea"
            :placeholder="placeholder"
          />
        </BField>
      </section>
      <footer class="modal-card-foot">
        <div class="level" style="width: 100%">
          <div class="level-left">
            <div class="level-item">
              <button class="button" type="button" @click="$parent.close()">
                Cancel
              </button>
              <button class="button is-primary">
                Add all
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </form>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data() {
    return {
      placeholder:
        "Atraxa, Praetors' Voice *CMDR* # Proliferate, Life gain\n3x Forest\n17 Persistent Petitioners # Mill",
      bulkInput: '',
    }
  },

  computed: {
    ...mapGetters({
      bulkAddErrorMessages: 'deck/bulkAddErrorMessages',
    }),
    hasErrors() {
      return this.bulkAddErrorMessages.length > 0
    },
    fieldMessages() {
      return this.bulkAddErrorMessages.reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: true,
        }),
        {}
      )
    },
  },

  mounted() {
    this.$refs.form.querySelector('textarea').focus()
  },
  methods: {
    async onSave() {
      const updates = this.bulkInput
        .split('\n')
        .map(i => i.trim())
        .filter(i => i)
      if (updates.length === 0) {
        return this.$parent.close()
      }

      await this.bulkAdd(updates)
      if (this.bulkAddErrorMessages.length === 0) {
        this.$parent.close()
      }
    },

    ...mapActions({
      bulkAdd: 'deck/bulkAdd',
    }),
  },
}
</script>
