<template>
  <div class="play-area has-background-light">
    <div class="battlefield" />
    <div class="other-zones">
      <div class="zone library">
        <h6 class="title is-6 has-background-light">Library</h6>
      </div>
      <div class="zone command-zone">
        <h6 class="title is-6 has-background-light">Command Zone</h6>
      </div>
      <div class="zone graveyard">
        <h6 class="title is-6 has-background-light">Graveyard</h6>
      </div>
      <div class="zone exile">
        <h6 class="title is-6 has-background-light">Exile</h6>
      </div>
    </div>
    <div class="zone hand">
      <h6 class="title is-6 has-background-light">Hand</h6>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  auth: false,

  components: {},

  async fetch({ store, params, error, $axios }) {
    try {
      const { data: deck } = await $axios.get(`/api/decks/${params.id}`)
      store.commit('playtest/deck', deck)
    } catch (e) {
      error({ statusCode: 404, message: 'Deck not found' })
    }
  },

  data: () => ({}),

  computed: {
    ...mapGetters({
      name: 'playtest/name',
    }),
  },

  mounted() {
    this.build()
    this.draw(7)
  },

  methods: {
    ...mapActions({
      build: 'playtest/build',
      draw: 'playtest/draw',
    }),
  },
}
</script>

<style scoped>
.play-area {
  height: calc(100vh - 52px);
  display: flex;
  flex-direction: column;
}

.battlefield {
  flex-grow: 1;
}

.zone {
  display: flex;
  min-height: 150px;
  position: relative;
  border: 1px solid grey;
  border-radius: 4px;
  margin: 0.5rem;
  padding: 0.5rem;
}

.zone h6 {
  position: absolute;
  top: 0;
  left: 0.5rem;
  transform: translateY(-50%);
  padding: 0 0.25rem;
}

.other-zones {
  display: flex;
}
.library {
  min-width: 150px;
}
.graveyard {
  min-width: 150px;
}
.exile {
  min-width: 150px;
}
.command-zone {
  min-width: 150px;
}
.hand {
}
</style>
