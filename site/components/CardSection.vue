<template>
  <div class="card-section">
    <div class="card-section-title">
      <span>
        {{ title }} <span v-if="showTotal">({{ numCardsTotal }})</span>
        <BIcon v-if="isAuto" icon="flash" />
        <BIcon v-if="isCompu" icon="auto-fix" />
      </span>
    </div>

    <div class="card-columns">
      <div
        v-for="column in columns"
        :key="column[0].source.name"
        class="cards-container"
      >
        <div
          v-for="card in column"
          :key="card.source.name"
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
      :show-edit-button="cardToShowcase && !cardToShowcase.isCommander"
      :special-shadow="
        !noSpecialShadow && cardToShowcase && cardToShowcase.isCommander
      "
      @edit-card="$emit('edit-card', cardToShowcase)"
      @close="isCardShowcaseOpen = false"
    />
  </div>
</template>

<script>
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
  },

  data() {
    return {
      isCardShowcaseOpen: false,
      cardToShowcase: null,
      numColumns: 1,
    }
  },

  computed: {
    columns() {
      return chunk(this.cards, Math.ceil(this.cards.length / this.numColumns))
    },

    numCardsTotal() {
      return this.cards.reduce((total, { count }) => total + count, 0)
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
  font-size: 110%;
  margin: 0.5rem;
  text-align: center;
}

@media (min-width: 769px) {
  .card-section-title {
    text-align: left;
  }
}

.card-section-title > span {
  position: relative;
}

/* .card-section-title > span::after {
  content: ' ';
  position: absolute;
  left: 0.1rem;
  right: 0.1rem;
  bottom: -0.2rem;
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.25);
} */

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
