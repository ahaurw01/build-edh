<template>
  <ul>
    <li><b>Number of cards:</b> {{ numCards }}</li>
    <li><b>Average CMC:</b> {{ averageCmc }}</li>
    <li><b>Median CMC:</b> {{ medianCmc }}</li>
    <li>
      <b>Casting cost pips:</b>
      <ul class="pip-list">
        <li
          v-for="({ count, ratio }, key) in castingCostPipCounts"
          :key="key"
          :style="{ order: -count }"
        >
          <i class="ms ms-cost" :class="`ms-${key.toLowerCase()}`" />:
          {{ count }} ({{ (ratio * 100).toFixed(1) }}%)
        </li>
      </ul>
    </li>
    <li><b>Total deck price:</b> ${{ deckPrice }}</li>
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
      deckPrice: 'deck/deckPrice',
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
.pip-list {
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
}
</style>
