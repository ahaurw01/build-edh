<template>
  <div class="box">
    <BButton
      v-if="editing"
      type="is-danger"
      icon-right="delete"
      @click="$emit('delete')"
    />
    <BSelect
      v-if="editing"
      placeholder="Select a field"
      :value="field"
      @input="onSelectField"
    >
      <option
        v-for="[key, displayName] in topLevelFields"
        :key="key"
        :value="key"
      >
        {{ displayName }}
      </option>
    </BSelect>
    <b v-else>{{ fieldDisplayName }}</b>

    <component
      :is="fieldToComponent(field)"
      v-if="field"
      :conditions="rule.conditions"
      :editing="editing"
      @onConditionsChange="onConditionsChange"
    /></div
></template>

<script>
import Type from './Type'

export const TYPE = 'type'
export const SUPERTYPE = 'supertype'
export const SUBTYPE = 'subtype'
export const CMC = 'cmc'
export const POWER = 'power'
export const TOUGHNESS = 'toughness'
export const LOYALTY = 'loyalty'
export const NAME = 'name'
export const RULES = 'rules'
export const COLOR = 'color'
export const MONOCOLOR = 'monocolor'
export const MULTICOLOR = 'multicolor'
export const TWOSIDED = 'twosided'

const topLevelFields = [
  [TYPE, 'Type'],
  [SUPERTYPE, 'Supertype'],
  [SUBTYPE, 'Subtype'],
  [CMC, 'Converted Mana Cost'],
  [POWER, 'Power'],
  [TOUGHNESS, 'Toughness'],
  [LOYALTY, 'Loyalty'],
  [NAME, 'Name Text'],
  [RULES, 'Rules Text'],
  [COLOR, 'Color'],
  [MONOCOLOR, 'Is Monocolor'],
  [MULTICOLOR, 'Is Multicolor'],
  [TWOSIDED, 'Is Two-Sided'],
]

export default {
  props: {
    rule: {
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

  data() {
    return {
      topLevelFields,
    }
  },

  computed: {
    fieldDisplayName() {
      const pair = topLevelFields.find(([field]) => field === this.field)
      return pair ? pair[1] : 'None'
    },

    field() {
      return this.rule.field
    },

    conditions() {
      return this.rule.conditions && this.rule.conditions.length
        ? this.rule.conditions
        : [{}]
    },
  },

  methods: {
    onSelectField(field) {
      this.$emit('change', {
        field,
        conditions: [{}],
      })
    },

    onConditionsChange(conditions) {
      this.$emit('change', {
        field: this.field,
        conditions,
      })
    },

    fieldToComponent(field) {
      switch (field) {
        case 'type':
          return Type
        default:
          return 'div'
      }
    },
  },
}
</script>

<style scoped></style>
