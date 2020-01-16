<template>
  <div class="value">
    <div v-if="editing">
      <div
        v-for="(condition, index) in conditions"
        :key="condition.value + index"
        class="level is-mobile"
      >
        <div class="level-item">
          <BSelect
            :placeholder="`Select ${valueDisplayName}`"
            :value="condition.value"
            @input="onSelectValue(index, $event)"
          >
            <option
              v-for="value in values"
              :key="value.key || value"
              :value="value.key || value"
            >
              {{ value.value || value }}
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
        <i>{{ condition.value }}</i>
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
    values: {
      type: Array,
      required: true,
    },
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
    onSelectValue(index, value) {
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
