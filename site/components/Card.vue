<template>
  <img :src="imgSrc" />
</template>

<script>
export default {
  props: {
    imgSrc: { type: String, default: null },
  },
}
</script>

<style scoped>
img {
  border-radius: 4.75% / 3.5%;
  width: 100%;
}
</style>
