<template>
  <div>
    <CompuPurpose
      v-for="(compuPurpose, index) in allCompuPurposes"
      :key="index"
      :compu-purpose="compuPurpose"
      @change="changeCompuPurpose(index, $event)"
      @delete="deleteCompuPurpose(index)"
    />

    <BButton v-if="allCompuPurposesAreValid" @click="addEmptyCompuPurpose">
      Create
    </BButton>

    <BModal :active.sync="isEditModalActive" has-modal-card>
      <CompuPurposeModalForm
        :compu-purpose="compuPurposeToEdit"
        @save="saveCompuPurpose"
      />
    </BModal>
  </div>
</template>

<script>
import {
  TYPE,
  // SUPERTYPE,
  // SUBTYPE,
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
      this.isEditModalActive = true
    },

    deleteCompuPurpose(index) {
      this.allCompuPurposes = [
        ...this.allCompuPurposes.slice(0, index),
        ...this.allCompuPurposes.slice(index + 1),
      ]
      this.$emit('change', this.allCompuPurposes)
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
