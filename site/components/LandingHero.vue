<template>
  <div>
    <div class="card-container">
      <div class="card-left">
        <Card
          img-src="https://img.scryfall.com/cards/large/en/cmd/261.jpg?1517813031"
        />
      </div>
      <div class="card-middle">
        <Card
          img-src="https://img.scryfall.com/cards/large/en/pcy/45.jpg?1517813031"
        />
      </div>
      <div class="card-right">
        <Card
          img-src="https://img.scryfall.com/cards/large/en/rtr/35.jpg?1517813031"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Card from '~/components/Card.vue'
export default {
  components: {
    Card
  }
}
</script>

<style scoped>
.card-container {
  margin: 40px 0;
  display: flex;
}

.card-left,
.card-middle,
.card-right {
  max-width: 33%;
}

@media (min-width: 480px) {
  .card-container {
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }
}

.card-middle {
  z-index: 1;
}

.card-left {
  transform: scale(0.85) translateX(15%);
}

.card-right {
  transform: scale(0.85) translateX(-15%);
}
</style>
