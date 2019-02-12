<template>
  <form @submit.prevent="_onSave">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add a commander
        </p>
      </header>
      <section class="modal-card-body">
        <BField label="Commander">
          <BAutocomplete
            v-model="nameLike"
            field="name"
            :data="cardSuggestions"
            keep-first
            @keyup.native="_getCardSuggestions"
          >
            <template slot-scope="props">
              <div class="media">
                <div class="media-left">
                  <Card size="x-small" :card="props.option" />
                </div>
                <div class="media-content">
                  {{ props.option.name }}
                </div>
              </div>
            </template>
          </BAutocomplete>
        </BField>
      </section>
      <footer class="modal-card-foot">
        <button class="button" type="button" @click="$parent.close()">
          Cancel
        </button>
        <button class="button is-primary">
          Add
        </button>
      </footer>
    </div>
  </form>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Card from '~/components/Card'
export default {
  components: {
    Card,
  },
  props: {
    commander: { type: Object, default: null },
    onSave: { type: Function, required: true },
  },
  data() {
    return {
      nameLike: '',
    }
  },
  computed: {
    ...mapGetters({ cardSuggestions: 'deck/cardSuggestions' }),
  },
  methods: {
    _onSave(e) {
      this.$parent.close()
    },
    _getCardSuggestions() {
      this.getCardSuggestions({
        nameLike: this.nameLike,
        canBeCommander: true,
      })
    },
    ...mapActions({ getCardSuggestions: 'deck/getCardSuggestions' }),
  },
}
</script>
