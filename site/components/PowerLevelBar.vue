<template>
  <div class="outer-bar">
    <div class="hider" :style="{ width: `${(100 * (10 - value)) / 10}%` }" />
  </div>
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
}
</script>

<style scoped>
.outer-bar {
  position: relative;
  height: 0.5rem;
  background: linear-gradient(
    90deg,
    rgba(73, 156, 232, 1) 0%,
    rgba(100, 205, 109, 1) 33%,
    rgba(250, 221, 110, 1) 67%,
    rgba(236, 76, 100, 1) 100%
  );
  overflow: hidden;
}

.hider {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background: hsl(0, 0%, 96%);
}
</style>
