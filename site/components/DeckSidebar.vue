<template>
  <div class="deck-sidebar column is-narrow" :class="{ 'is-open': isOpen }">
    <div class="box">
      <h2 class="title is-2 flex-title ">
        <span>Insights</span>
        <button class="close-button" @click="$emit('close')">
          <BIcon icon="close" />
        </button>
      </h2>

      <div>
        <h3 class="title is-3 ">Settings</h3>
        <BSwitch :value="usePurposeGroups" @input="setUsePurposeGroups">
          Group by <b>{{ usePurposeGroups ? 'purposes' : 'card type' }}</b>
        </BSwitch>
      </div>
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
  right: 1rem;
  top: 1rem;
  bottom: 1rem;
  transform: translateX(calc(100% + 1rem));
  transition: all 500ms;
  z-index: 30;
  width: auto;
  min-width: 50%;
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

@media (min-width: 769px) {
  .close-button {
    display: none;
  }

  .deck-sidebar {
    position: static;
    transform: translateX(0);
    width: auto;
    min-width: auto;
    margin-bottom: 1rem;
  }
}
</style>
