<template>
  <div class="card deck-tile">
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
        <div class="media-content">
          <h4 class="title is-4">
            {{ deck.name || 'Untitled deck' }}
          </h4>
          <p>
            {{ deck.purpose }}
          </p>
        </div>
      </div>
    </div>
    <PowerLevelBar :value="deck.powerLevel || 2" />
  </div>
</template>

<script>
import Card from './Card'
import PowerLevelBar from './PowerLevelBar'
export default {
  components: {
    Card,
    PowerLevelBar,
  },
  props: {
    deck: { type: Object, required: true },
  },
}
</script>

<style scoped>
.deck-tile {
  overflow: hidden;
}

.media-left {
  display: flex;
}

.media-left > :nth-child(2) {
  margin-left: 0.5rem;
}
</style>
