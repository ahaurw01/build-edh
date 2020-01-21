<template>
  <form ref="form" @submit.prevent="onSave">
    <section class="modal-card-body" style="overflow: visible">
      <BField :label="forCommander ? 'Commander' : 'Card'">
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
                  {{ props.option.name }}
                  <span v-if="props.option.faces[0].manaCost">-</span>
                  <ManaCost :mana-cost="props.option.faces[0].manaCost" />
                </h6>
                <p>{{ props.option.faces[0].oracleText }}</p>
              </div>
            </div>
          </template>
        </BAutocomplete>
      </BField>

      <BField v-if="printingsForCard.length > 0" label="Printing">
        <BAutocomplete
          :data="printingsForCard"
          :value="selectedCard.setName"
          field="setName"
          selection
          open-on-focus
          @keyup.native="setPrintingFilter"
          @select="selectCard"
        >
          <template slot-scope="props">
            <div class="media">
              <div class="media-left">
                <Card size="x-small" :card="props.option" />
              </div>
              <div class="media-content" style="white-space: normal;">
                <p class="is-size-6">{{ props.option.setName }}</p>
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

      <BField label="How Shiny">
        <BSwitch
          :disabled="!hasFoilChoice"
          :value="isFoil"
          type="is-warning"
          @input="isFoil = $event"
        >
          {{ isFoil ? 'Foil' : 'Non-foil' }}
        </BSwitch>
      </BField>

      <BField v-if="showCount && !forCommander" label="Number">
        <BNumberinput v-model="count" :min="1" :max="99" />
      </BField>
    </section>
    <footer class="modal-card-foot">
      <div class="level is-mobile" style="width: 100%">
        <div class="level-left">
          <div class="level-item">
            <button class="button" type="button" @click="parent.close()">
              Cancel
            </button>
            <button class="button is-primary">{{ actionName }}</button>
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
import ManaCost from '~/components/ManaCost'
export default {
  components: {
    Card,
    ManaCost,
  },
  props: {
    forCommander: { type: Boolean, default: false },
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
      count:
        this.card && this.card.source.canHaveMultiple
          ? this.card.count || 1
          : 1,
      printingFilter: '',
      isFoil: this.card ? this.card.isFoil : false,
    }
  },
  computed: {
    ...mapGetters({
      cardSuggestions: 'deck/cardSuggestions',
      suggestedPurposes: 'deck/suggestedPurposes',
      colorIdentity: 'deck/colorIdentity',
      printings: 'deck/printings',
    }),

    printingsForCard() {
      const { name } = this.selectedCard || {}
      const printings = this.printings[name] || []

      if (!this.printingFilter) return printings

      const regexp = new RegExp(this.printingFilter, 'i')
      return printings.filter(({ setName }) => regexp.test(setName))
    },

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

    showCount() {
      return this.selectedCard && this.selectedCard.canHaveMultiple
    },

    hasFoilChoice() {
      if (!this.selectedCard) return false

      return this.selectedCard.existsInFoil && this.selectedCard.existsInNonFoil
    },
  },

  mounted() {
    this.$refs.form.querySelector('input').focus()
    if (this.selectedCard) this.getPrintings(this.selectedCard)
  },
  methods: {
    selectCard(card) {
      this.selectedCard = card
      this.isFoil =
        this.selectedCard.existsInFoil && !this.selectedCard.existsInNonFoil

      this.getPrintings(card)
    },

    onSave() {
      if (!this.selectedCard) return
      const method =
        (this.edit ? 'update' : 'add') +
        (this.forCommander ? 'Commander' : 'Card')

      this[method]({
        uuid: this.edit ? this.card.uuid : undefined,
        scryfallId: this.selectedCard.scryfallId,
        purposes: this.purposes,
        isFoil: this.isFoil,
        count: this.count,
      })
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
      const method = `delete${this.forCommander ? 'Commander' : 'Card'}`
      if (this.confirmDelete) {
        this[method](this.card.uuid)
        this.parent.close()
      } else {
        this.confirmDelete = true
      }
    },

    setPrintingFilter(e) {
      this.printingFilter = e.target.value
    },

    ...mapActions({
      getCardSuggestions: 'deck/getCardSuggestions',
      addCard: 'deck/addCard',
      updateCard: 'deck/updateCard',
      deleteCard: 'deck/deleteCard',
      addCommander: 'deck/addCommander',
      updateCommander: 'deck/updateCommander',
      deleteComander: 'deck/deleteCommander',
      getPrintings: 'deck/getPrintings',
    }),
  },
}
</script>
