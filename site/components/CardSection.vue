<template>
  <div>
    <h4 class="title is-4">
      {{ title }}
    </h4>

    <Card
      v-for="card in cards"
      :key="card.source.name"
      :card="card.source"
      :count="card.count"
      size="medium"
      @click.prevent="$emit('edit-card', card)"
    />
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

<style scoped></style>
