<template>
  <div class="box">
    <BField v-if="editing" label="Description">
      <BInput
        placeholder="Title"
        :value="compuPurpose.title"
        @input="changeTitle"
      />
    </BField>

    <div v-else class="level">
      <div class="level-left">
        <div class="level-item">
          <h4 class="title is-4">{{ compuPurpose.title }}</h4>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <BButton icon-right="pencil" type="is-info" @click="$emit('edit')" />
        </div>
      </div>
    </div>

    <Rule
      v-for="(rule, index) in rules"
      :key="rule.field + index"
      :rule="rule"
      :editing="editing"
      @change="changeRule(index, $event)"
    />
    <button v-if="editing" class="button" @click="addEmptyRule">
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
    editing: {
      type: Boolean,
      default() {
        return false
      },
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

<style scoped>
.title {
  max-width: 17rem;
}
</style>
