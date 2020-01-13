<template>
  <div class="box">
    <BButton type="is-danger" icon-right="delete" @click="$emit('delete')" />
    <BSelect placeholder="Select a field" :value="field" @input="onSelectField">
      <option
        v-for="[key, displayName] in topLevelFields"
        :key="key"
        :value="key"
      >
        {{ displayName }}
      </option>
    </BSelect>
    <component
      :is="fieldToComponent(field)"
      v-if="field"
      :conditions="conditions"
      @onConditionsChange="onConditionsChange"
    />
  </div>
</template>

<script>
import Type from './CompuPurposes/Type'

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
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      topLevelFields,
      field: this.rule.field,
      conditions: this.rule.conditions || [{}],
    }
  },

  computed: {},

  methods: {
    onSelectField(field) {
      this.field = field
      this.$emit('onRuleChange', {
        field: this.field,
        conditions: this.conditions,
      })
    },

    onConditionsChange(conditions) {
      this.conditions = conditions
      this.$emit('onRuleChange', {
        field: this.field,
        conditions: this.conditions,
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
