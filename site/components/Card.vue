<template>
  <div :class="size" class="mtg-card">
    <img :src="card.imageUris.large" />
  </div>
</template>

<script>
export default {
  props: {
    card: { type: Object, required: true },
    size: {
      type: String,
      default: 'auto',
      validator(value) {
        return ['large', 'medium', 'small', 'auto'].indexOf(value) !== -1
      },
    },
  },
}
</script>

<style scoped>
.mtg-card:not(.auto) {
  display: inline-block;
  margin: 0.25rem;
}

img {
  border-radius: 4.75% / 3.5%;
  width: 100%;
  box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.25);
}

.large {
  max-width: 20rem;
}
.medium {
  max-width: 15rem;
}
.small {
  max-width: 10rem;
}
</style>
