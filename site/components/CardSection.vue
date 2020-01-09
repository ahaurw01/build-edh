<template>
  <div>
    <h4 class="title is-4">{{ title }} <BIcon v-if="isAuto" icon="flash" /></h4>

    <div class="cards-container">
      <div v-for="card in cards" :key="card.source.name" class="card-container">
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
    }
  },

  methods: {},
}
</script>

<style scoped>
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
