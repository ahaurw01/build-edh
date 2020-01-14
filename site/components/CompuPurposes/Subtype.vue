<template>
  <FlexType
    v-bind="$props"
    :types="subtypes"
    type-display-name="Subtype"
    v-on="$listeners"
  />
</template>

<script>
import { mapGetters } from 'vuex'
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

  computed: {
    ...mapGetters({
      subtypes: 'deck/subtypes',
    }),
  },
}
</script>

<style scoped></style>
