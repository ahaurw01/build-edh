<template>
  <div class="play-area has-background-light">
    <Drop class="battlefield" @drop="onDrop('battlefield', ...arguments)">
      <Drag
        v-for="(item, index) in battlefield"
        :key="item.deckCard.uuid"
        :style="{
          top: `${item.y}px`,
          left: `${item.x}px`,
          zIndex: battlefield.length - index,
        }"
        :transfer-data="{ fromZone: 'battlefield', item }"
        :class="{ tapped: item.tapped }"
        :image-x-offset="item.tapped ? 45 : 22"
        :image-y-offset="item.tapped ? 45 : 22"
        class="battlefield-card-wrapper"
        @dragstart="startDrag"
      >
        <button @click="tap(item)">
          <Card :card="item.deckCard.source" size="small" />
        </button>
        <template slot="image">
          <BIcon icon="target" size="is-large" />
        </template>
      </Drag>
    </Drop>
    <div class="other-zones">
      <div class="zone library">
        <h6 class="title is-6 has-background-light">
          <BButton @click="openLibraryModal">
            Library ({{ library.length }})
          </BButton>
        </h6>
        <Card
          v-if="library.length"
          :card="library[0].deckCard.source"
          size="small"
          face-down
        />
      </div>
      <div class="zone command-zone">
        <h6 class="title is-6 has-background-light">CZ</h6>
        <div
          v-for="item in commandZone"
          :key="item.deckCard.uuid"
          class="card-wrapper"
        >
          <Card :card="item.deckCard.source" size="small" />
        </div>
      </div>
      <div class="zone graveyard">
        <h6 class="title is-6 has-background-light">
          GY ({{ graveyard.length }})
        </h6>
        <div
          v-for="item in graveyard"
          :key="item.deckCard.uuid"
          class="card-wrapper"
        >
          <Card :card="item.deckCard.source" size="small" />
        </div>
      </div>
      <div class="zone exile">
        <h6 class="title is-6 has-background-light">
          Exile ({{ exile.length }})
        </h6>
        <div
          v-for="item in exile"
          :key="item.deckCard.uuid"
          class="card-wrapper"
        >
          <Card :card="item.deckCard.source" size="small" />
        </div>
      </div>
    </div>
    <div class="zone hand">
      <h6 class="title is-6 has-background-light">Hand ({{ hand.length }})</h6>
      <div
        v-for="item in hand"
        :key="item.deckCard.uuid"
        v-touch:start="startDragItem"
        v-touch:moving="_dragItem('hand', item)"
        :class="{ dragging: item.x != null }"
        :style="styleFromItem(item)"
        class="card-wrapper"
      >
        <Card :card="item.deckCard.source" size="small" />
      </div>
    </div>

    <BModal :active.sync="libraryModalIsShowing" has-modal-card>
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Library ({{ library.length }})</p>
        </header>
        <section class="modal-card-body">
          <div class="modal-cards-wrapper">
            <div
              v-for="(item, index) in library"
              :key="item.deckCard.uuid"
              class="modal-card-wrapper"
            >
              <button @click="libraryActionOverlayIndex = index">
                <Card
                  :card="item.deckCard.source"
                  :face-down="!libraryCardsAreFaceUp"
                  size="small"
                />
              </button>

              <div
                v-if="libraryActionOverlayIndex === index"
                class="modal-card-actions"
              >
                <BButton
                  type="is-light"
                  @click="
                    move({
                      fromZone: 'library',
                      toZone: 'hand',
                      item: library[index],
                    })
                    libraryActionOverlayIndex = -1
                  "
                >
                  To Hand
                </BButton>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <div class="level is-mobile" style="width: 100%">
            <div class="level-left">
              <div class="level-item">
                <BButton @click="libraryModalIsShowing = false">
                  Close
                </BButton>
              </div>
              <div class="level-item">
                <BButton type="is-primary" @click="_shuffleLibrary">
                  Shuffle
                </BButton>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <BSwitch v-model="libraryCardsAreFaceUp">Show cards?</BSwitch>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BModal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ToastProgrammatic as Toast } from 'buefy'
import { Drag, Drop } from 'vue-drag-drop'
import Card from '~/components/Card'

export default {
  auth: false,

  components: { Card, Drag, Drop },

  async fetch({ store, params, error, $axios }) {
    try {
      const { data: deck } = await $axios.get(`/api/decks/${params.id}`)
      store.commit('playtest/deck', deck)
      store.dispatch('playtest/build')
      store.dispatch('playtest/draw', 7)
    } catch (e) {
      error({ statusCode: 404, message: 'Deck not found' })
    }
  },

  data: () => ({
    libraryModalIsShowing: false,
    libraryCardsAreFaceUp: false,
    libraryActionOverlayIndex: -1,
    latestDragOffsets: { x: 0, y: 0 },
  }),

  computed: {
    ...mapGetters({
      name: 'playtest/name',
      library: 'playtest/library',
      hand: 'playtest/hand',
      battlefield: 'playtest/battlefield',
      commandZone: 'playtest/commandZone',
      graveyard: 'playtest/graveyard',
      exile: 'playtest/exile',
    }),
  },

  mounted() {},

  methods: {
    ...mapActions({
      build: 'playtest/build',
      draw: 'playtest/draw',
      shuffleLibrary: 'playtest/shuffleLibrary',
      move: 'playtest/move',
      tap: 'playtest/tap',
      dragItem: 'playtest/dragItem',
    }),

    openLibraryModal() {
      this.libraryActionOverlayIndex = -1
      this.libraryCardsAreFaceUp = false
      this.libraryModalIsShowing = true
    },

    _shuffleLibrary() {
      this.shuffleLibrary()
      Toast.open({ message: '🎲 library shuffled 🎲', type: 'is-success' })
    },

    startDragItem(event) {
      this.latestDragOffsets = {
        x: event.touches[0].pageX - event.target.getBoundingClientRect().left,
        y: event.touches[0].pageY - event.target.getBoundingClientRect().top,
      }
    },

    _dragItem(zone, item) {
      return event => {
        console.log(event)
        this.dragItem({
          zone,
          item,
          x: Math.max(0, event.touches[0].pageX - this.latestDragOffsets.x),
          y: Math.max(52, event.touches[0].pageY - this.latestDragOffsets.y),
        })
      }
    },

    styleFromItem(item) {
      if (item.x == null) return {}
      return {
        top: `${item.y}px`,
        left: `${item.x}px`,
      }
    },

    // onDrop(toZone, { fromZone, item }, nativeEvent) {
    //   this.move({
    //     toZone,
    //     fromZone,
    //     item,
    //     x: Math.max(0, nativeEvent.pageX - this.latestDragOffsets.x),
    //     y: Math.max(0, nativeEvent.pageY - this.latestDragOffsets.y - 52),
    //   })
    // },
  },
}
</script>

<style scoped>
.play-area {
  height: calc(100vh - 52px);
  display: flex;
  flex-direction: column;
}

.battlefield {
  flex-grow: 1;
  position: relative;
}

.zone {
  display: flex;
  min-height: 150px;
  position: relative;
  border: 1px solid grey;
  border-radius: 4px;
  margin: 0.5rem;
  padding: 0.5rem;
}

.zone h6 {
  position: absolute;
  top: 0;
  left: 0.5rem;
  transform: translateY(-50%);
  padding: 0 0.25rem;
}

.other-zones {
  display: flex;
  max-width: 100%;
}
.library {
  min-width: 75px;
}
.graveyard {
  min-width: 75px;
}
.exile {
  min-width: 75px;
}
.command-zone {
  min-width: 75px;
}
.hand {
}

.card-wrapper {
  width: 75px;
}

.modal-cards-wrapper {
  display: flex;
  flex-wrap: wrap;
}
.modal-card-wrapper {
  position: relative;
}
.modal-card-wrapper > button {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
}
.modal-card-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  padding: 0.5rem;
}

.battlefield-card-wrapper {
  position: absolute;
  transition: transform 250ms;
}

.battlefield-card-wrapper > button {
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
}

.tapped {
  transform: rotate(40deg);
}

.dragging {
  position: fixed;
}
</style>
