<template>
  <div class="type">
    <div v-if="editing">
      <div
        v-for="(condition, index) in conditions"
        :key="condition.type + index"
        class="level is-mobile"
      >
        <div class="level-item">is:</div>
        <div class="level-item">
          <BSelect
            placeholder="Select a type"
            :value="condition.type"
            @input="onSelectType(index, $event)"
          >
            <option v-for="type in types" :key="type" :value="type">
              {{ type }}
            </option>
          </BSelect>
        </div>

        <div class="level-item">
          <BButton
            :disabled="conditions.length < 2"
            type="is-danger"
            icon-right="delete"
            @click="deleteCondition(index)"
          />
        </div>
      </div>
      <div class="level">
        <div class="level-item">
          <button
            v-if="canAddAnotherCondition"
            class="button"
            @click="addAnotherCondition"
          >
            Or...
          </button>
        </div>
      </div>
    </div>
    <span v-else>{{ displayString }}</span>
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

<style scoped>
.type {
  display: inline;
}
</style>
