<template>
  <div class="deck-sidebar" :class="{ 'is-open': isOpen }">
    <h2 class="title is-2 flex-title">
      <span>Insight stuff</span>
      <button class="close-button" @click="$emit('close')">
        <BIcon icon="close" />
      </button>
    </h2>

    <div class="box">
      <h3 class="title is-3">Settings</h3>
      <BSwitch :value="usePurposeGroups" @input="setUsePurposeGroups">
        {{ usePurposeGroups ? 'Group by purposes' : 'Group by card type' }}
      </BSwitch>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    isOpen: { type: Boolean, required: true },
  },

  computed: {
    ...mapGetters({
      usePurposeGroups: 'deck/usePurposeGroups',
    }),
  },

  methods: {
    ...mapActions({
      setUsePurposeGroups: 'deck/setUsePurposeGroups',
    }),
  },
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
  background: white;
  z-index: 999;
  width: 100%;
  padding: 1rem;
}

.is-open {
  /* Used for opening/closing on mobile. */
  transform: translateX(0);
}

.flex-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
}
</style>
