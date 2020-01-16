<template>
  <div class="box">
    <div v-if="editing" class="level">
      <div class="level-left select-container">
        <div class="level is-mobile">
          <div class="level-item">
            <BButton
              type="is-danger"
              icon-right="delete"
              :disabled="!canDelete"
              @click="$emit('delete')"
            />
          </div>
          <div class="level-item">
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
          </div>
          <div class="level-item">
            <BSelect :value="is" @input="onIsChange">
              <option :value="true">{{ operators[0] }}</option>
              <option :value="false">{{ operators[1] }}</option>
            </BSelect>
          </div>
        </div>
      </div>

      <div class="level-right">
        <component
          :is="fieldToComponent(field)"
          v-if="field"
          :conditions="rule.conditions"
          editing
          @onConditionsChange="onConditionsChange"
        />
      </div>
    </div>

    <div v-else>
      <b>{{ fieldDisplayName }} </b>
      {{ is ? operators[0] : operators[1] }}
      <component
        :is="fieldToComponent(field)"
        v-if="field"
        :conditions="rule.conditions"
      />
    </div>
  </div>
</template>

<script>
import Type from './Type'
import Supertype from './Supertype'
import Subtype from './Subtype'
import Cmc from './Cmc'
import Power from './Power'
import Toughness from './Toughness'
import Loyalty from './Loyalty'
import Color from './Color'
import NumColors from './NumColors'
import NameText from './NameText'

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
export const NUMCOLORS = 'numcolors'

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
  [NUMCOLORS, 'Number of Colors'],
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
    canDelete: {
      type: Boolean,
      required: true,
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

    operators() {
      switch (this.rule.field) {
        case NAME:
        case RULES:
          return ['contains', 'does non contain']
        default:
          return ['is', 'is not']
      }
    },

    conditions() {
      return this.rule.conditions && this.rule.conditions.length
        ? this.rule.conditions
        : [{}]
    },

    is() {
      return this.rule.is != null ? this.rule.is : true
    },
  },

  methods: {
    onSelectField(field) {
      this.$emit('change', {
        field,
        is: this.is,
        conditions: [{}],
      })
    },

    onConditionsChange(conditions) {
      this.$emit('change', {
        field: this.field,
        is: this.is,
        conditions,
      })
    },

    onIsChange(is) {
      this.$emit('change', {
        field: this.field,
        is,
        conditions: this.conditions,
      })
    },

    fieldToComponent(field) {
      switch (field) {
        case TYPE:
          return Type
        case SUPERTYPE:
          return Supertype
        case SUBTYPE:
          return Subtype
        case CMC:
          return Cmc
        case POWER:
          return Power
        case TOUGHNESS:
          return Toughness
        case LOYALTY:
          return Loyalty
        case COLOR:
          return Color
        case NUMCOLORS:
          return NumColors
        case NAME:
          return NameText
        default:
          return 'div'
      }
    },
  },
}
</script>

<style scoped>
@media (min-width: 768px) {
  .select-container {
    margin-right: 1rem;
  }
}
</style>
