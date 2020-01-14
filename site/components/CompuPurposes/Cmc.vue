<template>
  <FlexType
    v-bind="$props"
    :types="convertedManaCosts"
    type-display-name="CMC"
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
      convertedManaCosts: 'deck/convertedManaCosts',
    }),
  },
}
</script>

<style scoped></style>
