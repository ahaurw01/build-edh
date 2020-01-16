<template>
  <div class="value">
    <div v-if="editing">
      <div
        v-for="(condition, index) in conditions"
        :key="index"
        class="level is-mobile"
      >
        <div class="level-item">
          <BInput
            :placeholder="valueDisplayName"
            :value="condition.value"
            @input="onInput(index, $event)"
          />
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
      <div v-if="canAddAnotherCondition" class="level">
        <div class="level-item">
          <button class="button" @click="addAnotherCondition">
            Or...
          </button>
        </div>
      </div>
    </div>
    <span v-else>
      <span v-for="(condition, index) in conditions" :key="index">
        <code>{{ condition.value }}</code>
        <span v-if="index < conditions.length - 1"> or </span>
      </span>
    </span>
  </div>
</template>

<script>
import get from 'lodash/get'
import last from 'lodash/last'

export default {
  props: {
    valueDisplayName: {
      type: String,
      required: true,
    },
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

  computed: {
    canAddAnotherCondition() {
      return this.editing && !!get(last(this.conditions), 'value')
    },

    displayString() {
      return this.conditions.map(c => c.value).join(' or ')
    },
  },

  methods: {
    onInput(index, value) {
      this.$emit('onConditionsChange', [
        ...this.conditions.slice(0, index),
        { value },
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
.value {
  display: inline;
}
</style>
