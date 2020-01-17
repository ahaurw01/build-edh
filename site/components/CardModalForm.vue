<template>
  <form ref="form" @submit.prevent="onSave">
    <section class="modal-card-body" style="overflow: visible">
      <BField label="Card">
        <BAutocomplete
          v-model="nameLike"
          field="name"
          :data="cardSuggestions"
          keep-first
          @keyup.native="_getCardSuggestions"
          @select="selectCard"
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

      <BField label="Purposes">
        <BTaginput
          v-model="purposes"
          icon="label"
          placeholder="E.g. Card draw, Sac outlet"
          allow-new
          :data="filteredSuggestedPurposes"
          autocomplete
          @typing="setFilteredSuggestedPurposes"
        />
      </BField>
    </section>
    <footer class="modal-card-foot">
      <div class="level" style="width: 100%">
        <div class="level-left">
          <div class="level-item">
            <button class="button" type="button" @click="parent.close()">
              Cancel
            </button>
            <button class="button is-primary">
              {{ actionName }}
            </button>
          </div>
        </div>
        <div v-if="edit" class="level-right">
          <div class="level-item">
            <button class="button is-danger" type="button" @click="onDelete">
              {{ deleteText }}
            </button>
          </div>
        </div>
      </div>
    </footer>
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
    card: { type: Object, default: null },
    edit: { type: Boolean, default: false },
  },
  data() {
    return {
      nameLike: this.card ? this.card.source.name : '',
      selectedCard: this.card ? this.card.source : null,
      purposes: [...(this.card ? this.card.purposes : [])],
      filteredSuggestedPurposes: this.suggestedPurposes,
      confirmDelete: false,
    }
  },
  computed: {
    ...mapGetters({
      cardSuggestions: 'deck/cardSuggestions',
      suggestedPurposes: 'deck/suggestedPurposes',
      colorIdentity: 'deck/colorIdentity',
    }),
    actionName() {
      return this.edit ? 'Update' : 'Add'
    },
    deleteText() {
      return this.confirmDelete ? 'Are you sure?' : 'Delete'
    },
    parent() {
      function findParent(vm) {
        if ('function' === typeof vm.close) {
          return vm
        }
        return findParent(vm.$parent)
      }
      return findParent(this.$parent)
    },
  },
  mounted() {
    this.$refs.form.querySelector('input').focus()
  },
  methods: {
    selectCard(card) {
      this.selectedCard = card
    },

    onSave() {
      if (this.edit) {
        this.updateCard({
          uuid: this.card.uuid,
          scryfallId: this.selectedCard.scryfallId,
          purposes: this.purposes,
          isFoil: false,
        })
      } else {
        this.addCard({
          scryfallId: this.selectedCard.scryfallId,
          purposes: this.purposes,
        })
      }
      this.parent.close()
    },

    _getCardSuggestions: debounce(function() {
      this.getCardSuggestions({
        nameLike: this.nameLike,
        isLegal: true,
        ci: this.colorIdentity,
      })
    }, 200),

    setFilteredSuggestedPurposes(text) {
      text = text.trim()
      const suggestedPurposesWithoutSelections = this.suggestedPurposes.filter(
        purpose => !this.purposes.includes(purpose)
      )

      if (text.length <= 2) {
        this.filteredSuggestedPurposes = suggestedPurposesWithoutSelections
        return
      }

      this.filteredSuggestedPurposes = suggestedPurposesWithoutSelections.filter(
        purpose => purpose.toLowerCase().includes(text.toLowerCase())
      )
    },

    onDelete() {
      if (this.confirmDelete) {
        this.deleteCard(this.card.uuid)
        this.parent.close()
      } else {
        this.confirmDelete = true
      }
    },

    ...mapActions({
      getCardSuggestions: 'deck/getCardSuggestions',
      addCard: 'deck/addCard',
      updateCard: 'deck/updateCard',
      deleteCard: 'deck/deleteCard',
    }),
  },
}
</script>
