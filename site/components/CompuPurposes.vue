<template>
  <div>
    <CompuPurpose
      v-for="(compuPurpose, index) in allCompuPurposes"
      :key="index"
      :compu-purpose="compuPurpose"
      @change="changeCompuPurpose(index, $event)"
      @delete="deleteCompuPurpose(index)"
    />
    <button
      v-if="allCompuPurposesAreValid"
      class="button"
      @click="addEmptyCompuPurpose"
    >
      And...
    </button>
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

export default {
  components: { CompuPurpose },
  props: {
    compuPurposes: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      allCompuPurposes: this.compuPurposes,
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
      this.allCompuPurposes = [
        ...this.allCompuPurposes,
        { title: '', rules: [{}] },
      ]
    },

    deleteCompuPurpose(index) {
      this.allCompuPurposes = [
        ...this.allCompuPurposes.slice(0, index),
        ...this.allCompuPurposes.slice(index + 1),
      ]
      this.$emit('change', this.allCompuPurposes)
    },
  },
}
</script>

<style scoped></style>
