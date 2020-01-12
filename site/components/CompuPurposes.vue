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
import CompuPurpose from './CompuPurpose'
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
    },
  },
}
</script>

<style scoped></style>
