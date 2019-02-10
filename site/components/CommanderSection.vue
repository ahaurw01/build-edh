<template>
  <section>
    <h3 class="title is-3">
      Commander
    </h3>
    <Card
      v-for="commander in commanders"
      :key="commander.source.name"
      :card="commander.source"
      size="large"
    />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import Card from '~/components/Card'
export default {
  components: {
    Card,
  },
  computed: {
    ...mapGetters({ commanders: 'deck/commanders' }),
  },
}
</script>

<style scoped></style>
