<template>
  <FlexValue
    v-bind="$props"
    :values="subtypes"
    value-display-name="Subtype"
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
      subtypes: 'deck/subtypes',
    }),
  },
}
</script>

<style scoped></style>
