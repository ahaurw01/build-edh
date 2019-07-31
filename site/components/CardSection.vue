<template>
  <div>
    <h4 class="title is-4">
      {{ title }}
    </h4>

    <div class="cards-container">
      <div v-for="card in cards" :key="card.source.name" class="card-container">
        <div class="card-container-inner">
          <Card
            :card="card.source"
            :count="card.count"
            size="medium"
            show-edit-button
            @edit-card="$emit('edit-card', card)"
          />
        </div>
      </div>
    </div>
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
  transition: transform 250ms;
  transform-origin: bottom left;
}

.card-container:hover .card-container-inner {
  transform: rotate(-2deg) translateX(-0.1rem);
}
</style>
