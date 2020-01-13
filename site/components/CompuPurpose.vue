<template>
  <div class="box">
    <BButton type="is-danger" icon-right="delete" @click="$emit('delete')" />
    <BField label="Description">
      <BInput
        placeholder="Title"
        :value="compuPurpose.title"
        @input="changeTitle"
      />
    </BField>
    <Rule
      v-for="(rule, index) in rules"
      :key="rule.field + index"
      :rule="rule"
      @change="changeRule(index, $event)"
    />
    <button class="button" @click="addEmptyRule">
      And...
    </button>
  </div>
</template>

<script>
import Rule from './CompuPurposes/Rule'

export default {
  components: { Rule },

  props: {
    compuPurpose: {
      type: Object,
      required: true,
    },
  },

  computed: {
    rules() {
      return this.compuPurpose.rules || [{}]
    },
  },

  methods: {
    changeTitle(title) {
      this.$emit('change', {
        ...this.compuPurpose,
        title,
      })
    },

    changeRule(index, rule) {
      const update = {
        ...this.compuPurpose,
        rules: [
          ...this.rules.slice(0, index),
          rule,
          ...this.rules.slice(index + 1),
        ],
      }
      this.$emit('change', update)
    },

    addEmptyRule() {
      const update = {
        ...this.compuPurpose,
        rules: [...this.rules, {}],
      }
      this.$emit('change', update)
    },
  },
}
</script>

<style scoped></style>
