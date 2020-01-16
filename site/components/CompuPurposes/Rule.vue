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
              <option :value="true">is</option>
              <option :value="false">is not</option>
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
      {{ is ? 'is' : 'is not' }}
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
