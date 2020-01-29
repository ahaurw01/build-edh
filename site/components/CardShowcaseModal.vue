<template>
  <BModal :active="isOpen" custom-class="card-showcase-modal" v-on="$listeners">
    <div class="modal-centerer">
      <div class="modal-column">
        <BTaglist v-if="purposes.length">
          <BTag
            v-for="purpose in purposes"
            :key="purpose.text"
            type="is-white"
            size="is-medium"
          >
            <div class="purpose-tag">
              <BIcon :icon="purpose.icon" />
              <span>&nbsp;{{ purpose.text }}</span>
            </div>
          </BTag>
        </BTaglist>

        <div class="columns">
          <div v-if="card" class="column">
            <Card
              :card="card.source"
              :is-foil="card.isFoil"
              :count="card.count"
              :show-edit-button="showEditButton"
              :special-shadow="specialShadow"
              size="large"
              @edit-card="
                $emit('close')
                $emit('edit-card', card)
              "
            />
          </div>
          <div
            v-if="
              card && card.source.faces[1] && card.source.faces[1].imageUris
            "
            class="column"
          >
            <Card
              :card="card.source"
              :special-shadow="specialShadow"
              size="large"
              reverse
            />
          </div>
        </div>

        <div class="price has-text-white">{{ price }}</div>
      </div>
    </div>
  </BModal>
</template>

<script>
import get from 'lodash/get'
import { mapGetters, mapActions } from 'vuex'
import Card from '~/components/Card'
export default {
  components: {
    Card,
  },

  props: {
    card: {
      type: Object,
      default() {
        return null
      },
    },
    isOpen: { type: Boolean, required: true },
    showEditButton: { type: Boolean, default: false },
    specialShadow: { type: Boolean, default: false },
  },

  computed: {
    ...mapGetters({
      cardUuidToCompuPurposeTitles: 'deck/cardUuidToCompuPurposeTitles',
      prices: 'deck/prices',
    }),

    purposes() {
      if (!this.card) return []
      return [
        ...this.card.purposes.map(text => ({
          icon: 'cards-outline',
          text,
        })),
        ...(this.cardUuidToCompuPurposeTitles[this.card.uuid] || []).map(
          text => ({
            icon: 'auto-fix',
            text,
          })
        ),
      ]
    },

    price() {
      const tcgplayerId = get(this, 'card.source.tcgplayerId')
      if (!tcgplayerId || !this.prices[tcgplayerId]) return null

      const { usd, usdFoil } = this.prices[tcgplayerId]

      let displayValue = get(this, 'card.isFoil', false) ? usdFoil : usd

      if (displayValue) displayValue = `$${displayValue}`

      return displayValue
    },
  },

  watch: {
    'card.source.tcgplayerId': function() {
      const { source } = this.card || {}
      if (source) this.getPriceForCard(source)
    },
  },

  methods: {
    ...mapActions({
      getPriceForCard: 'deck/getPriceForCard',
    }),
  },
}
</script>

<style scoped>
.modal-centerer {
  display: flex;
  justify-content: center;
}

.modal-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.purpose-tag {
  display: flex;
  align-items: center;
}

.tag {
  background-color: hsl(0, 0%, 96%) !important;
}
</style>

<style>
.card-showcase-modal .modal-content {
  max-height: unset;
}
</style>
