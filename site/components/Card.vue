<template>
  <img :src="card.imageUris.large" />
</template>

<script>
export default {
  props: {
    card: { type: Object, required: true },
  },
}
</script>

<style scoped>
img {
  border-radius: 4.75% / 3.5%;
  width: 100%;
}
</style>
