<template>
  <div>
    <div v-if="editing">
      <div
        v-for="(condition, index) in conditions"
        :key="condition.type + index"
      >
        is:
        <BSelect
          placeholder="Select a type"
          :value="condition.type"
          @input="onSelectType(index, $event)"
        >
          <option v-for="type in types" :key="type" :value="type">
            {{ type }}
          </option>
        </BSelect>
        <BButton
          v-if="conditions.length > 1"
          type="is-danger"
          icon-right="delete"
          @click="deleteCondition(index)"
        />
      </div>
    </div>
    <span v-else>{{ displayString }}</span>
    <button
      v-if="canAddAnotherCondition"
      class="button"
      @click="addAnotherCondition"
    >
      Or...
    </button>
  </div>
</template>

<script>
import get from 'lodash/get'
import last from 'lodash/last'

const types = [
  'Instant',
  'Sorcery',
  'Creature',
  'Artifact',
  'Enchantment',
  'Land',
  'Planeswalker',
  'Tribal',
]
export default {
  props: {
    conditions: {
      type: Array,
      default() {
        return [{}]
      },
    },
    editing: {
      type: Boolean,
      default() {
        return false
      },
    },
  },

  data() {
    return { types }
  },

  computed: {
    canAddAnotherCondition() {
      return this.editing && !!get(last(this.conditions), 'type')
    },

    displayString() {
      return `is ${this.conditions.map(c => c.type).join(' or ')}`
    },
  },

  methods: {
    onSelectType(index, type) {
      this.$emit('onConditionsChange', [
        ...this.conditions.slice(0, index),
        { type },
        ...this.conditions.slice(index + 1),
      ])
    },

    addAnotherCondition() {
      this.$emit('onConditionsChange', [...this.conditions, {}])
    },

    deleteCondition(index) {
      this.$emit('onConditionsChange', [
        ...this.conditions.slice(0, index),
        ...this.conditions.slice(index + 1),
      ])
    },
  },
}
</script>

<style scoped></style>
