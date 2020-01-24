<template>
  <div>
    <CompuPurpose
      v-for="(compuPurpose, index) in allCompuPurposes"
      :key="index"
      :compu-purpose="compuPurpose"
      @edit="editCompuPurpose(index)"
    />

    <BButton
      v-if="iAmOwner && allCompuPurposesAreValid"
      type="is-dark"
      icon-left="auto-fix"
      @click="addEmptyCompuPurpose"
    >
      Create new computed purpose
    </BButton>

    <BModal :active.sync="isEditModalActive" has-modal-card>
      <CompuPurposeModalForm
        :can-delete="canDeleteCompuPurposeToEdit"
        :compu-purpose="compuPurposeToEdit"
        @save="saveCompuPurpose"
        @delete="deleteCompuPurpose"
      />
    </BModal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CompuPurpose from './CompuPurpose'
import CompuPurposeModalForm from './CompuPurposeModalForm'

export default {
  components: { CompuPurpose, CompuPurposeModalForm },
  props: {
    compuPurposes: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      allCompuPurposes: this.compuPurposes,
      isEditModalActive: false,
      compuPurposeToEdit: null,
      compuPurposeToEditIndex: 0,
      canDeleteCompuPurposeToEdit: false,
    }
  },

  computed: {
    ...mapGetters({
      iAmOwner: 'deck/iAmOwner',
    }),

    allCompuPurposesAreValid() {
      return this.allCompuPurposes.every(({ rules = [{}] }) =>
        rules.every(rule => this.isRuleValid(rule))
      )
    },
  },

  methods: {
    isRuleValid(rule) {
      return rule.conditions.every(c => c.value)
    },

    changeCompuPurpose(index, compuPurpose) {
      this.allCompuPurposes = [
        ...this.allCompuPurposes.slice(0, index),
        compuPurpose,
        ...this.allCompuPurposes.slice(index + 1),
      ]

      if (this.allCompuPurposesAreValid)
        this.$emit('change', this.allCompuPurposes)
    },

    addEmptyCompuPurpose() {
      this.compuPurposeToEdit = {}
      this.compuPurposeToEditIndex = this.allCompuPurposes.length
      this.canDeleteCompuPurposeToEdit = false
      this.isEditModalActive = true
    },

    editCompuPurpose(index) {
      this.compuPurposeToEdit = this.allCompuPurposes[index]
      this.compuPurposeToEditIndex = index
      this.canDeleteCompuPurposeToEdit = true
      this.isEditModalActive = true
    },

    deleteCompuPurpose() {
      const index = this.compuPurposeToEditIndex
      this.allCompuPurposes = [
        ...this.allCompuPurposes.slice(0, index),
        ...this.allCompuPurposes.slice(index + 1),
      ]
      this.$emit('change', this.allCompuPurposes)
      this.isEditModalActive = false
    },

    saveCompuPurpose(newCompuPurpose) {
      this.allCompuPurposes = [
        ...this.allCompuPurposes.slice(0, this.compuPurposeToEditIndex),
        newCompuPurpose,
        ...this.allCompuPurposes.slice(this.compuPurposeToEditIndex + 1),
      ]

      if (this.allCompuPurposesAreValid)
        this.$emit('change', this.allCompuPurposes)

      this.isEditModalActive = false
    },
  },
}
</script>

<style scoped></style>
