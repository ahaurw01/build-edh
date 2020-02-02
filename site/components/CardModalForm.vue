<template>
  <form ref="form" @submit.prevent="onSave">
    <section class="modal-card-body" style="overflow: visible">
      <BField :label="forCommander ? 'Commander' : 'Card'">
        <BAutocomplete
          v-model="nameLike"
          v-focus
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

      <BField v-if="selectedCard" label="Printing">
        <BAutocomplete
          :data="printingsForCard"
          :value="selectedCard.setName"
          field="setName"
          selection
          open-on-focus
          @keyup.native="_getPrintings"
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

      <div class="columns">
        <div class="column">
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
        </div>
        <div v-if="!forCommander" class="column">
          <BField label="Consideration">
            <BSwitch
              :value="!isConsideration"
              @input="isConsideration = !$event"
            >
              {{
                isConsideration ? 'Just a consideration' : "It's in the deck"
              }}
            </BSwitch>
          </BField>
        </div>
      </div>

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
import get from 'lodash/get'
import { mapGetters, mapActions } from 'vuex'
import Card from '~/components/Card'
import ManaCost from '~/components/ManaCost'
import Presser from '~/components/Presser'

const BASIC_NAMES = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest']

export default {
  components: {
    Card,
    ManaCost,
  },

  directives: {
    focus(el) {
      setTimeout(() => {
        // Bail if an input is already selected.
        if (
          document.activeElement &&
          document.activeElement instanceof HTMLInputElement
        )
          return
        const input = el.querySelector('input')
        if (!input) return
        if (!input.value) input.focus()
      }, 100)
    },
  },

  props: {
    onlyForCommander: { type: Boolean, default: false },
    card: { type: Object, default: null },
    edit: { type: Boolean, default: false },
  },
  data() {
    return {
      nameLike: this.card ? this.card.source.name : '',
      selectedCard: this.card ? this.card.source : null,
      purposes: [...(this.card ? this.card.purposes : [])],
      suggestedPurposeFilter: '',
      confirmDelete: false,
      count:
        this.card && this.card.source.canHaveMultiple
          ? this.card.count || 1
          : 1,
      isFoil: this.card ? this.card.isFoil : false,
      isConsideration: this.card ? this.card.isConsideration : false,
    }
  },
  computed: {
    ...mapGetters({
      cardSuggestions: 'deck/cardSuggestions',
      suggestedPurposes: 'deck/suggestedPurposes',
      colorIdentity: 'deck/colorIdentity',
      printings: 'deck/printings',
    }),

    forCommander() {
      return this.onlyForCommander || (this.card && this.card.isCommander)
    },

    printingsForCard() {
      const { name } = this.selectedCard || {}
      const printings = this.printings[name] || []
      return printings.length > 0 ? printings : [this.selectedCard]
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

    suggestedPurposesWithoutSelections() {
      return this.suggestedPurposes.filter(
        purpose => !this.purposes.includes(purpose)
      )
    },

    filteredSuggestedPurposes() {
      if (this.suggestedPurposeFilter.length <= 1) {
        return this.suggestedPurposesWithoutSelections
      }

      return this.suggestedPurposesWithoutSelections.filter(purpose =>
        purpose
          .toLowerCase()
          .includes(this.suggestedPurposeFilter.toLowerCase())
      )
    },
  },

  mounted() {
    if (this.selectedCard) {
      this._getPrintings()
    }
    this.presser = new Presser()
    this.presser.on('submitForm', () => this.onSave())
  },

  beforeDestroy() {
    this.presser.off()
  },

  methods: {
    selectCard(card) {
      if (!card) return
      this.selectedCard = card
      this.isFoil =
        this.selectedCard.existsInFoil && !this.selectedCard.existsInNonFoil

      this._getPrintings()
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
        isConsideration: this.isConsideration,
        count: this.count,
        name: this.selectedCard.name,
      })
      this.parent.close()
    },

    _getCardSuggestions: debounce(function() {
      this.getCardSuggestions({
        nameLike: this.nameLike,
        isLegal: true,
        canBeCommander: this.forCommander ? true : undefined,
        ci: this.forCommander ? undefined : this.colorIdentity,
      })
    }, 200),

    setFilteredSuggestedPurposes(text) {
      this.suggestedPurposeFilter = text.trim()
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

    _getPrintings(e) {
      let setNameFilter = get(e, 'target.value', '').trim()

      // Special logic for basic lands which we know have a million printings.
      const isBasicLand = BASIC_NAMES.includes(this.selectedCard.name)
      if (isBasicLand && !setNameFilter) {
        setNameFilter = this.selectedCard.setName
      }

      this.getPrintings({ card: this.selectedCard, setNameFilter })
    },

    ...mapActions({
      getCardSuggestions: 'deck/getCardSuggestions',
      addCard: 'deck/addCard',
      updateCard: 'deck/updateCard',
      deleteCard: 'deck/deleteCard',
      addCommander: 'deck/addCommander',
      updateCommander: 'deck/updateCommander',
      deleteCommander: 'deck/deleteCommander',
      getPrintings: 'deck/getPrintings',
    }),
  },
}
</script>
