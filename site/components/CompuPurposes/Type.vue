<template>
  <FlexType
    v-bind="$props"
    :types="types"
    type-display-name="Type"
    v-on="$listeners"
  />
</template>

<script>
import FlexType from './FlexType'

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
  components: { FlexType },
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
