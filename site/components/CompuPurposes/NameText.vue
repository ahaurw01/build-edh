<template>
  <FlexText v-bind="$props" value-display-name="Name Text" v-on="$listeners" />
</template>

<script>
import FlexText from './FlexText'

export default {
  components: { FlexText },

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
