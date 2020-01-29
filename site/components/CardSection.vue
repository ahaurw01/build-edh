<template>
  <div class="card-section">
    <div class="card-section-title">
      <BIcon v-if="showIcon" :icon="icon" />
      <span v-if="showIcon">&nbsp;</span>
      <span>{{ title }}</span>
      <span v-if="showTotal">&nbsp;({{ numCardsTotal }})</span>
    </div>

    <div class="card-columns">
      <div
        v-for="column in columns"
        :key="column[0].source.scryfallId"
        class="cards-container"
      >
        <div
          v-for="card in column"
          :key="card.source.scryfallId"
          class="card-container"
        >
          <button
            class="card-container-inner"
            @click="
              isCardShowcaseOpen = true
              cardToShowcase = card
            "
          >
            <Card
              :card="card.source"
              :count="card.count"
              :is-foil="card.isFoil"
              :special-shadow="!noSpecialShadow && card.isCommander"
              size="medium"
            />
          </button>
        </div>
      </div>
    </div>

    <CardShowcaseModal
      :card="cardToShowcase"
      :is-open="isCardShowcaseOpen"
      :show-edit-button="iAmOwner"
      :special-shadow="
        !noSpecialShadow && cardToShowcase && cardToShowcase.isCommander
      "
      @edit-card="$emit('edit-card', cardToShowcase)"
      @close="isCardShowcaseOpen = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import chunk from 'lodash/chunk'
import Card from '~/components/Card'
import CardShowcaseModal from '~/components/CardShowcaseModal'
export default {
  components: {
    Card,
    CardShowcaseModal,
  },

  props: {
    title: { type: String, required: true },
    cards: { type: Array, required: true },
    isAuto: { type: Boolean, required: false },
    isCompu: { type: Boolean, required: false },
    noSpecialShadow: { type: Boolean, default: false },
    showTotal: { type: Boolean, default: false },
    showIcon: { type: Boolean, default: false },
  },

  data() {
    return {
      isCardShowcaseOpen: false,
      cardToShowcase: null,
      numColumns: 1,
    }
  },

  computed: {
    ...mapGetters({
      iAmOwner: 'deck/iAmOwner',
    }),

    columns() {
      return chunk(this.cards, Math.ceil(this.cards.length / this.numColumns))
    },

    numCardsTotal() {
      return this.cards.reduce((total, { count }) => total + count, 0)
    },

    icon() {
      if (this.isAuto) return 'flash'
      if (this.isCompu) return 'auto-fix'
      return 'cards-outline'
    },
  },

  mounted() {
    this.oneColumnWatcher = window.matchMedia('(max-width: 768px)')
    this.twoColumnWatcher = window.matchMedia(
      '(min-width: 769px) and (max-width: 999px)'
    )
    this.threeColumnWatcher = window.matchMedia('(min-width: 999px)')

    this.oneColumnWatcher.addListener(this.watchForOneColumn)
    this.twoColumnWatcher.addListener(this.watchForTwoColumns)
    this.threeColumnWatcher.addListener(this.watchForThreeColumns)

    this.watchForOneColumn(this.oneColumnWatcher)
    this.watchForTwoColumns(this.twoColumnWatcher)
    this.watchForThreeColumns(this.threeColumnWatcher)
  },

  beforeDestroy() {
    this.oneColumnWatcher.removeListener(this.watchForOneColumn)
    this.twoColumnWatcher.removeListener(this.watchForTwoColumns)
    this.threeColumnWatcher.removeListener(this.watchForThreeColumns)
  },

  methods: {
    watchForOneColumn: function(e) {
      if (e.matches) this.numColumns = 1
    },

    watchForTwoColumns: function(e) {
      if (e.matches) this.numColumns = 2
    },

    watchForThreeColumns: function(e) {
      if (e.matches) this.numColumns = 3
    },
  },
}
</script>

<style scoped>
.card-section {
  margin-bottom: 1rem;
}

.card-section-title {
  display: flex;
  align-items: center;
  font-size: 110%;
  margin: 0.5rem 0;
}

.card-columns {
  display: flex;
  justify-content: space-around;
}

@media (min-width: 769px) {
  .card-columns {
    justify-content: flex-start;
  }
}

.cards-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-container {
  height: 2.4rem;
}

.card-container:last-child {
  height: auto;
}

.card-container-inner {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 250ms;
  transform-origin: bottom left;
}

.card-container:hover .card-container-inner {
  transform: rotate(-2deg) translateX(-0.1rem);
}
</style>
