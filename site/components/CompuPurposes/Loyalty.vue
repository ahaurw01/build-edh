<template>
  <FlexValue
    v-bind="$props"
    :values="loyalties"
    value-display-name="Loyalty"
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
      loyalties: 'deck/loyalties',
    }),
  },
}
</script>

<style scoped></style>
