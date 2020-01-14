<template>
  <FlexValue
    v-bind="$props"
    :values="types"
    value-display-name="Type"
    v-on="$listeners"
  />
</template>

<script>
import FlexValue from './FlexValue'

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
  components: { FlexValue },
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
}
</script>

<style scoped></style>
