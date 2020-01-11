<template>
  <div>
    <h4 class="title is-4">
      {{ title }}
      <BIcon v-if="isAuto" icon="flash" />
    </h4>

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
            <Card :card="card.source" :count="card.count" size="medium" />
          </button>
        </div>
      </div>
    </div>

    <BModal :active.sync="isCardShowcaseOpen">
      <div class="modal-centerer">
        <Card
          v-if="cardToShowcase"
          :card="cardToShowcase.source"
          :count="cardToShowcase.count"
          size="large"
          show-edit-button
          @edit-card="
            isCardShowcaseOpen = false
            $emit('edit-card', cardToShowcase)
          "
        />
      </div>
    </BModal>
  </div>
</template>

<script>
import chunk from 'lodash/chunk'
import Card from '~/components/Card'
export default {
  components: {
    Card,
  },

  props: {
    title: { type: String, required: true },
    cards: { type: Array, required: true },
    isAuto: { type: Boolean, required: false },
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
.card-columns {
  display: flex;
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

.modal-centerer {
  display: flex;
  justify-content: center;
}
</style>
