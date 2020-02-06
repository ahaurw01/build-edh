<template>
  <div class="modal-card token-modal">
    <form ref="form" @submit.prevent="onSave">
      <header class="modal-card-head">
        <p class="modal-card-title">Tokens</p>
      </header>
      <section class="modal-card-body" style="overflow: visible">
        <BField label="Name">
          <BAutocomplete
            v-focus
            field="name"
            :data="tokenSuggestions"
            keep-first
            @keyup.native="searchForTokens($event.target.value)"
            @select="selectToken"
          >
            <template slot-scope="props">
              <div class="media">
                <div class="media-left">
                  <Card size="x-small" :card="props.option" />
                </div>
                <div class="media-content" style="white-space: normal;">
                  <h6 class="title is-6">
                    {{ props.option.name }}
                  </h6>
                  <p>{{ props.option.oracleText }}</p>
                </div>
              </div>
            </template>
          </BAutocomplete>
        </BField>

        <BField label="How many?">
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
              <button class="button is-primary">Create</button>
            </div>
          </div>
        </div>
      </footer>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Card from '~/components/Card'
import Presser from '~/components/Presser'

export default {
  components: {
    Card,
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

  data() {
    return {
      selectedToken: null,
      count: 1,
    }
  },
  computed: {
    ...mapGetters({
      tokenSuggestions: 'playtest/tokenSuggestions',
    }),

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
    this.presser = new Presser()
    this.presser.on('submitForm', () => this.onSave())
  },

  beforeDestroy() {
    this.presser.off()
  },

  methods: {
    selectToken(token) {
      this.selectedToken = token
    },

    onSave() {
      if (!this.selectedToken) return
      this.createTokens({ token: this.selectedToken, count: this.count })

      this.parent.close()
    },

    ...mapActions({
      searchForTokens: 'playtest/searchForTokens',
      createTokens: 'playtest/createTokens',
    }),
  },
}
</script>

<style scoped>
.token-modal {
  overflow: visible;
}
</style>
