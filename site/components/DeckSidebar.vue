<template>
  <div class="deck-sidebar" :class="{ 'is-open': isOpen }">
    <h2 class="title is-2">Insight stuff</h2>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: { type: Boolean, required: true },
  },
  computed: {},
  methods: {},
}
</script>

<style scoped>
.deck-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  transform: translateX(100%);
  transition: all 500ms;
}

.is-open {
  /* Used for opening/closing on mobile. */
  transform: translateX(0);
}
</style>
