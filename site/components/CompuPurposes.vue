<template>
  <div>
    <CompuPurpose
      v-for="(compuPurpose, index) in allCompuPurposes"
      :key="index"
      :compu-purpose="compuPurpose"
      @edit="editCompuPurpose(index)"
    />

    <BButton
      v-if="allCompuPurposesAreValid"
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
import {
  TYPE,
  SUPERTYPE,
  SUBTYPE,
  // CMC,
  // POWER,
  // TOUGHNESS,
  // LOYALTY,
  // NAME,
  // RULES,
  // COLOR,
  // MONOCOLOR,
  // MULTICOLOR,
  // TWOSIDED,
} from './CompuPurposes/Rule'
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
    allCompuPurposesAreValid() {
      return this.allCompuPurposes.every(({ rules = [{}] }) =>
        rules.every(rule => this.isRuleValid(rule))
      )
    },
  },

  methods: {
    isRuleValid(rule) {
      switch (rule.field) {
        case TYPE:
        case SUPERTYPE:
        case SUBTYPE:
          return rule.conditions.every(c => c.type)
        default:
          return false
      }
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
