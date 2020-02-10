<template>
  <!-- Pass a change handler to get notified of updates. -->
  <BSlider v-model="localValue" :min="1" :max="10" ticks v-on="$listeners" />
</template>

<script>
/**
 * Our power levels:
 * 1
 * 2: Jank
 * 3
 * 4: Casual
 * 5
 * 6: Focused
 * 7
 * 8: Optimized
 * 9
 * 10: Competitive
 */

export default {
  props: {
    value: { type: Number, required: true },
  },

  data() {
    return {
      localValue: this.value,
    }
  },
}
</script>

<style scoped></style>
