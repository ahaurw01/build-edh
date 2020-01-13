<template>
  <div>
    <CompuPurpose
      v-for="(rule, index) in allRules"
      :key="rule.field + index"
      :rule="rule"
      @onRuleChange="onRuleChange(index, $event)"
    />
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

function areAllRulesValid(rules) {
  return rules.every(rule => {
    switch (rule.field) {
      case TYPE:
        return rule.conditions.every(c => c.type)
      default:
        return false
    }
  })
}

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

  computed: {},

  methods: {
    onRuleChange(index, rule) {
      this.allRules = [
        ...this.allRules.slice(0, index),
        rule,
        ...this.allRules.slice(index + 1),
      ]

      if (areAllRulesValid(this.allRules)) this.$emit('onChange', this.allRules)
    },
  },
}
</script>

<style scoped></style>
