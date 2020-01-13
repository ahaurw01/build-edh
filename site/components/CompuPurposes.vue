<template>
  <div>
    <CompuPurpose
      v-for="(rule, index) in allRules"
      :key="rule.field + index"
      :rule="rule"
      @onRuleChange="onRuleChange(index, $event)"
      @delete="deleteRule(index)"
    />
    <button v-if="allRulesAreValid" class="button" @click="addEmptyRule">
      And...
    </button>
  </div>
</template>

<script>
import CompuPurpose, {
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
} from './CompuPurpose'

export default {
  components: { CompuPurpose },
  props: {
    rules: {
      type: Array,
      default() {
        return [{}]
      },
    },
  },
  data() {
    return {
      allRules: this.rules,
    }
  },

  computed: {
    allRulesAreValid() {
      return this.allRules.every(rule => this.isRuleValid(rule))
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

    onRuleChange(index, rule) {
      this.allRules = [
        ...this.allRules.slice(0, index),
        rule,
        ...this.allRules.slice(index + 1),
      ]

      if (this.allRulesAreValid) this.$emit('onChange', this.allRules)
    },

    addEmptyRule() {
      this.allRules = [...this.allRules, {}]
      this.$emit('onChange', this.allRules)
    },

    deleteRule(index) {
      this.allRules = [
        ...this.allRules.slice(0, index),
        ...this.allRules.slice(index + 1),
      ]
      this.$emit('onChange', this.allRules)
    },
  },
}
</script>

<style scoped></style>
