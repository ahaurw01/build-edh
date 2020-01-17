<template>
  <div class="deck-sidebar column is-narrow" :class="{ 'is-open': isOpen }">
    <div class="box deck-sidebar-content">
      <h2 class="title is-2 flex-title ">
        <span>Insights</span>
        <button class="close-button" @click="$emit('close')">
          <BIcon icon="close" />
        </button>
      </h2>

      <h3 class="title is-3 ">Settings</h3>
      <BSwitch :value="usePurposeGroups" @input="setUsePurposeGroups">
        Group by <b>{{ usePurposeGroups ? 'purposes' : 'card type' }}</b>
      </BSwitch>

      <hr />

      <h3 class="title is-3">Computed Purposes</h3>
      <CompuPurposes
        :compu-purposes="compuPurposes"
        @change="updateCompuPurposes"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CompuPurposes from './CompuPurposes'

export default {
  components: { CompuPurposes },
  props: {
    isOpen: { type: Boolean, required: true },
  },

  computed: {
    ...mapGetters({
      usePurposeGroups: 'deck/usePurposeGroups',
      compuPurposes: 'deck/compuPurposes',
    }),
  },

  methods: {
    ...mapActions({
      setUsePurposeGroups: 'deck/setUsePurposeGroups',
      updateCompuPurposes: 'deck/updateCompuPurposes',
    }),
  },
}
</script>

<style scoped>
.deck-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  transform: translateX(calc(100% + 1rem));
  transition: all 500ms;
  z-index: 30;
  width: auto;
  min-width: 50%;
  height: 100vh;
  padding: 1rem;
  overflow: auto;
}

.is-open {
  /* Used for opening/closing on mobile. */
  transform: none;
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

@media (max-width: 768px) {
  .deck-sidebar-content {
    box-shadow: 0 0 8px 8px rgba(0, 0, 0, 0.25);
  }
}

@media (min-width: 769px) {
  .close-button {
    display: none;
  }

  .deck-sidebar {
    position: static;
    transform: none;
    width: auto;
    min-width: auto;
    margin-bottom: 1rem;
    max-height: calc(100vh - 40px);
    overflow: auto;
  }
}
</style>
