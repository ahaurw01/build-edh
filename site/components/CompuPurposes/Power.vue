<template>
  <FlexValue
    v-bind="$props"
    :values="powers"
    value-display-name="Power"
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
      powers: 'deck/powers',
    }),
  },
}
</script>

<style scoped></style>
