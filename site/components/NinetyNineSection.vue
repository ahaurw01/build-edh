<template>
  <section>
    <h3 class="title is-3">
      {{ title }}
    </h3>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
// import Card from '~/components/Card'
export default {
  components: {
    // Card,
  },
  data() {
    return {}
  },

  computed: {
    title() {
      return this.commanders.length === 2 ? 'The 98' : 'The 99'
    },
    ...mapGetters(
      ['commanders'].reduce((acc, key) => {
        acc[key] = `deck/${key}`
        return acc
      }, {})
    ),
  },
  methods: {},
}
</script>

<style scoped></style>
