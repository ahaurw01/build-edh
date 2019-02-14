<template>
  <form @submit.prevent="onSave">
    <div class="modal-card" style="overflow: visible">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add a commander
        </p>
      </header>
      <section class="modal-card-body" style="overflow: visible">
        <BField label="Commander">
          <BAutocomplete
            v-model="nameLike"
            field="name"
            :data="cardSuggestions"
            keep-first
            @keyup.native="_getCardSuggestions"
            @select="selectCommander"
          >
            <template slot-scope="props">
              <div class="media">
                <div class="media-left">
                  <Card size="x-small" :card="props.option" />
                </div>
                <div class="media-content" style="white-space: normal;">
                  <h6 class="title is-6">
                    {{ props.option.name }} -
                    {{ props.option.faces[0].manaCost }}
                  </h6>
                  <p>
                    {{ props.option.faces[0].oracleText }}
                  </p>
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
import debounce from 'lodash/debounce'
import { mapGetters, mapActions } from 'vuex'
import Card from '~/components/Card'
export default {
  components: {
    Card,
  },
  props: {
    commander: { type: Object, default: null },
  },
  data() {
    return {
      nameLike: '',
      selectedCommander: null,
    }
  },
  computed: {
    ...mapGetters({ cardSuggestions: 'deck/cardSuggestions' }),
  },
  methods: {
    selectCommander(card) {
      this.selectedCommander = card
    },

    onSave(e) {
      this.addCommander({ scryfallId: this.selectedCommander.scryfallId })
      this.$parent.close()
    },

    _getCardSuggestions: debounce(function() {
      this.getCardSuggestions({
        nameLike: this.nameLike,
        canBeCommander: true,
        isLegal: true,
      })
    }, 200),
    ...mapActions({
      getCardSuggestions: 'deck/getCardSuggestions',
      addCommander: 'deck/addCommander',
    }),
  },
}
</script>
