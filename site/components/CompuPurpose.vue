<template>
  <div class="box">
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

const topLevelFields = [
  ['type', 'Type'],
  ['supertype', 'Supertype'],
  ['subtype', 'Subtype'],
  ['cmc', 'Converted Mana Cost'],
  ['power', 'Power'],
  ['toughness', 'Toughness'],
  ['loyalty', 'Loyalty'],
  ['name', 'Name Text'],
  ['rules', 'Rules Text'],
  ['color', 'Color'],
  ['monocolor', 'Is Monocolor'],
  ['multicolor', 'Is Multicolor'],
  ['twosided', 'Is Two-Sided'],
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
      console.log(JSON.stringify(conditions))
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
