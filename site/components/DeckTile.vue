<template>
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div v-if="deck.commanders.length" class="media-left">
          <Card
            v-for="commander in deck.commanders"
            :key="commander.source.name"
            :card="commander.source"
            size="x-small"
          />
        </div>
        <div class="content">
          <h4 class="title is-4">
            {{ deck.name || 'Untitled deck' }}
          </h4>
          <p>
            {{ deck.purpose }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Card from './Card'
export default {
  components: {
    Card,
  },
  props: {
    deck: { type: Object, required: true },
  },
}
</script>

<style scoped>
.media-left {
  display: flex;
}

.media-left > :nth-child(2) {
  margin-left: 0.5rem;
}
</style>
