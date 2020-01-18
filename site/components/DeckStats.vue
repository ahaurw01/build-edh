<template>
  <ul>
    <li><b>Number of cards:</b> {{ numCards }}</li>
    <li><b>Average CMC:</b> {{ averageCmc }}</li>
    <li><b>Median CMC:</b> {{ medianCmc }}</li>
    <li>
      <b>Casting cost pips:</b>
      <ul class="nested-list">
        <li v-for="({ count, ratio }, key) in castingCostPipCounts" :key="key">
          <b>{{ key }}:</b> {{ count }} ({{ (ratio * 100).toFixed(1) }}%)
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      numCards: 'deck/numCards',
      averageCmc: 'deck/averageCmc',
      medianCmc: 'deck/medianCmc',
      castingCostPipCounts: 'deck/castingCostPipCounts',
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
  transition: transform 200ms;
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

.close-button {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1;
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
    max-height: calc(100vh - 40px);
    overflow: auto;
  }
}

.nested-list {
  margin-left: 1rem;
}
</style>
