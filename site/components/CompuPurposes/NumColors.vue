<template>
  <FlexValue
    v-bind="$props"
    :values="numColors"
    value-display-name="Number of Colors"
    v-on="$listeners"
  />
</template>

<script>
import { mapGetters } from 'vuex'
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

  computed: {
    ...mapGetters({
      numColors: 'deck/numColors',
    }),
  },
}
</script>

<style scoped></style>
