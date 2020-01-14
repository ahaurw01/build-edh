<template>
  <FlexType
    v-bind="$props"
    :types="['Basic', 'Legendary', 'Snow', 'World']"
    type-display-name="Supertype"
    v-on="$listeners"
  />
</template>

<script>
import FlexType from './FlexType'

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
}
</script>

<style scoped></style>
