<template>
  <section>
    <h2 class="title is-2">
      <span>{{ deck.name || 'Untitled' }} by {{ owner.username }}</span>
    </h2>
  </section>
</template>

<script>
export default {
  async asyncData({ params, error, $axios }) {
    try {
      const { data: deck } = await $axios.get(`/api/decks/${params.id}`)
      const { data: owner } = await $axios.get(`/api/users/${deck.owner}`)
      return { deck, owner }
    } catch (e) {
      error({ statusCode: 404, message: 'Deck not found' })
    }
  },
}
</script>

<style></style>
