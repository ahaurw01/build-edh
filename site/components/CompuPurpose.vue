<template>
  <div class="box">
    <BField v-if="editing" label="Description">
      <BInput
        placeholder="Title"
        :value="compuPurpose.title"
        @input="changeTitle"
      />
    </BField>

    <div v-else class="level is-mobile">
      <div class="level-left">
        <div class="level-item">
          <h5 class="title is-5">{{ compuPurpose.title }}</h5>
        </div>
      </div>
      <div v-if="iAmOwner" class="level-right">
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
      :can-delete="rules.length > 1"
      @change="changeRule(index, $event)"
      @delete="deleteRule(index)"
    />
    <button v-if="editing" class="button" @click.prevent="addEmptyRule">
      And...
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
    ...mapGetters({
      iAmOwner: 'deck/iAmOwner',
    }),

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

    deleteRule(index) {
      const update = {
        ...this.compuPurpose,
        rules: [...this.rules.slice(0, index), ...this.rules.slice(index + 1)],
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
