<template>
  <form @submit.prevent="$emit('save', localCompuPurpose)">
    <div class="modal-card" style="width: auto">
      <section class="modal-card-body">
        <CompuPurpose
          :compu-purpose="localCompuPurpose"
          @change="localCompuPurpose = $event"
        />
      </section>
      <footer class="modal-card-foot">
        <div class="level" style="width: 100%">
          <div class="level-left">
            <div class="level-item">
              <button class="button" type="button" @click="$parent.close()">
                Cancel
              </button>
              <button class="button is-primary">
                Save
              </button>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button
                v-if="canDelete"
                class="button is-danger"
                type="button"
                @click.prevent="$emit('delete')"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </form>
</template>

<script>
import CompuPurpose from './CompuPurpose'
export default {
  components: { CompuPurpose },
  props: {
    canDelete: { type: Boolean, required: true },
    compuPurpose: { type: Object, required: true },
  },

  data() {
    return {
      localCompuPurpose: { ...this.compuPurpose },
    }
  },
}
</script>
