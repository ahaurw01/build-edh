<template>
  <BModal :active="isOpen" custom-class="card-showcase-modal" v-on="$listeners">
    <div class="modal-centerer">
      <div class="modal-column">
        <BTaglist v-if="card && card.purposes.length > 0">
          <BTag
            v-for="purpose in card.purposes"
            :key="purpose"
            type="is-primary"
            size="is-medium"
          >
            {{ purpose }}
          </BTag>
        </BTaglist>

        <div class="columns">
          <div v-if="card" class="column">
            <Card
              :card="card.source"
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
      </div>
    </div>
  </BModal>
</template>

<script>
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
</style>

<style>
.card-showcase-modal .modal-content {
  max-height: unset;
}
</style>
