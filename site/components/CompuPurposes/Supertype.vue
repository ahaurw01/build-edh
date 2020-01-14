<template>
  <FlexValue
    v-bind="$props"
    :values="['Basic', 'Legendary', 'Snow', 'World']"
    value-display-name="Supertype"
    v-on="$listeners"
  />
</template>

<script>
import FlexValue from './FlexValue'

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
}
</script>

<style scoped></style>
