<template>
  <div>
    <h4 class="title is-4">
      {{ title }}
    </h4>

    <div class="cards-container">
      <div v-for="card in cards" :key="card.source.name" class="card-container">
        <Card
          :card="card.source"
          :count="card.count"
          size="medium"
          @click.prevent="$emit('edit-card', card)"
        />
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
</style>
