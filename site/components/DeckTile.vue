<template>
  <div class="card">
    <div class="card-content">
      <h3 class="title is-3">
        {{ deck.name || 'Untitled deck' }}
      </h3>
      <h5 class="subtitle is-5">
        {{ deck.purpose }}
      </h5>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    deck: { type: Object, required: true },
  },
}
</script>

<style scoped></style>
