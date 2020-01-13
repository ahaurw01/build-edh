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
        <button class="button" type="button" @click="$parent.close()">
          Cancel
        </button>
        <button class="button is-primary">
          Save
        </button>
      </footer>
    </div>
  </form>
</template>

<script>
import CompuPurpose from './CompuPurpose'
export default {
  components: { CompuPurpose },
  props: {
    compuPurpose: { type: Object, required: true },
  },

  data() {
    return {
      localCompuPurpose: { ...this.compuPurpose },
    }
  },
}
</script>
