<template>
  <FlexValue
    v-bind="$props"
    :values="toughnesses"
    value-display-name="Toughness"
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
      toughnesses: 'deck/toughnesses',
    }),
  },
}
</script>

<style scoped></style>
