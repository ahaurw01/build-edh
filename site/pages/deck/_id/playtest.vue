<template>
  <div
    v-touch:start="startDragItem"
    v-touch:moving="_dragItem"
    v-touch:end="dropItem"
    class="play-area has-background-light"
  >
    <div
      :class="{ hovered: hoveredZone === 'battlefield' }"
      class="dz battlefield"
    >
      <div
        v-for="(item, index) in battlefield"
        :key="item.deckCard.uuid"
        v-touch:tap="_tap(item.deckCard.uuid)"
        :data-drag-info="
          JSON.stringify({ zone: 'battlefield', uuid: item.deckCard.uuid })
        "
        :style="{ ...styleFromItem(item, battlefield.length, index) }"
        :class="{ tapped: item.tapped }"
        class="battlefield-card-wrapper"
      >
        <Card :card="item.deckCard.source" :size="cardWidth" />
      </div>

      <div class="battlefield-actions">
        <BButton @click="nextTurn">Turn: {{ turn }}</BButton>
        <div class="life">
          <BButton icon-left="minus" @click="bumpLife(-1)" />
          <span>&nbsp;{{ life }}&nbsp;</span>
          <BButton icon-left="plus" @click="bumpLife(1)" />
        </div>
      </div>
    </div>
    <div class="other-zones">
      <div
        :style="zoneStyle"
        :class="{ hovered: hoveredZone === 'library' }"
        class="dz zone library"
      >
        <h6 class="title is-6 has-background-light">
          Lib ({{ library.length }})
        </h6>
        <div :style="{ height: `${cardHeight}px`, minWidth: `${cardWidth}px` }">
          <div
            v-for="(item, index) in library"
            :key="item.deckCard.uuid"
            v-touch:tap="openLibraryModal"
            :data-drag-info="
              JSON.stringify({
                zone: 'library',
                uuid: item.deckCard.uuid,
              })
            "
            :style="{ display: index > 0 ? 'none' : 'block' }"
            class="card-wrapper"
          >
            <Card :card="item.deckCard.source" :size="cardWidth" face-down />
          </div>
        </div>
      </div>
      <div
        :style="zoneStyle"
        :class="{ hovered: hoveredZone === 'commandZone' }"
        class="dz zone commandZone"
      >
        <h6 class="title is-6 has-background-light">
          CZ ({{ commandZone.length }})
        </h6>
        <div :style="{ height: `${cardHeight}px`, minWidth: `${cardWidth}px` }">
          <div
            v-for="(item, index) in commandZone"
            :key="item.deckCard.uuid"
            :data-drag-info="
              JSON.stringify({ zone: 'commandZone', uuid: item.deckCard.uuid })
            "
            :style="{ display: index > 0 ? 'none' : 'block' }"
            class="card-wrapper"
          >
            <Card :card="item.deckCard.source" :size="cardWidth" />
          </div>
        </div>
      </div>
      <div
        :style="zoneStyle"
        :class="{ hovered: hoveredZone === 'graveyard' }"
        class="dz zone graveyard"
      >
        <h6 class="title is-6 has-background-light">
          GY ({{ graveyard.length }})
        </h6>
        <div :style="{ height: `${cardHeight}px`, minWidth: `${cardWidth}px` }">
          <div
            v-for="(item, index) in graveyard"
            :key="item.deckCard.uuid"
            v-touch:tap="openGraveyardModal"
            :data-drag-info="
              JSON.stringify({
                zone: 'graveyard',
                uuid: item.deckCard.uuid,
              })
            "
            :style="{ display: index > 0 ? 'none' : 'block' }"
            class="card-wrapper"
          >
            <Card :card="item.deckCard.source" :size="cardWidth" />
          </div>
        </div>
      </div>
      <div
        :style="zoneStyle"
        :class="{ hovered: hoveredZone === 'exile' }"
        class="dz zone exile"
      >
        <h6 class="title is-6 has-background-light">Ex ({{ exile.length }})</h6>
        <div :style="{ height: `${cardHeight}px`, minWidth: `${cardWidth}px` }">
          <div
            v-for="(item, index) in exile"
            :key="item.deckCard.uuid"
            v-touch:tap="openExileModal"
            :data-drag-info="
              JSON.stringify({
                zone: 'exile',
                uuid: item.deckCard.uuid,
              })
            "
            :style="{ display: index > 0 ? 'none' : 'block' }"
            class="card-wrapper"
          >
            <Card :card="item.deckCard.source" :size="cardWidth" />
          </div>
        </div>
      </div>
    </div>
    <div
      :style="zoneStyle"
      :class="{ hovered: hoveredZone === 'hand' }"
      class="dz zone hand"
    >
      <h6 class="title is-6 has-background-light">Hand ({{ hand.length }})</h6>
      <div
        :style="{
          height: `${cardHeight + 10}px`,
          maxWidth: `${(cardWidth + 4) * hand.length}px`,
        }"
        class="hand-inner"
      >
        <div
          v-for="(item, index) in handReversed"
          :key="item.deckCard.uuid"
          :data-drag-info="
            JSON.stringify({ zone: 'hand', uuid: item.deckCard.uuid })
          "
          :style="handStyleFromItem(item, hand.length, index)"
          class="card-wrapper hand-card-wrapper"
        >
          <Card :card="item.deckCard.source" :size="cardWidth" />
        </div>
      </div>
    </div>

    <div
      v-if="isDragging"
      class="drag-dummy card-wrapper"
      :class="{ tapped: draggingItem.tapped }"
      :style="{
        position: 'fixed',
        top: `${currentDragCoordinates.y}px`,
        left: `${currentDragCoordinates.x}px`,
        width: `${cardWidth}px`,
      }"
      v-html="draggingElement.outerHTML"
    />

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
                      uuid: library[index].deckCard.uuid,
                    })
                    libraryActionOverlayIndex = -1
                  "
                >
                  Move to Hand
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

    <BModal :active.sync="graveyardModalIsShowing" has-modal-card>
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Graveyard ({{ graveyard.length }})</p>
        </header>
        <section class="modal-card-body">
          <div class="modal-cards-wrapper">
            <div
              v-for="(item, index) in graveyard"
              :key="item.deckCard.uuid"
              class="modal-card-wrapper"
            >
              <button @click="graveyardActionOverlayIndex = index">
                <Card :card="item.deckCard.source" size="small" />
              </button>

              <div
                v-if="graveyardActionOverlayIndex === index"
                class="modal-card-actions"
              >
                <BButton
                  type="is-light"
                  @click="
                    move({
                      fromZone: 'graveyard',
                      toZone: 'hand',
                      uuid: graveyard[index].deckCard.uuid,
                    })
                    graveyardActionOverlayIndex = -1
                  "
                >
                  Move to Hand
                </BButton>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <div class="level is-mobile" style="width: 100%">
            <div class="level-left">
              <div class="level-item">
                <BButton @click="graveyardModalIsShowing = false">
                  Close
                </BButton>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BModal>

    <BModal :active.sync="exileModalIsShowing" has-modal-card>
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Exile ({{ exile.length }})</p>
        </header>
        <section class="modal-card-body">
          <div class="modal-cards-wrapper">
            <div
              v-for="(item, index) in exile"
              :key="item.deckCard.uuid"
              class="modal-card-wrapper"
            >
              <button @click="exileActionOverlayIndex = index">
                <Card :card="item.deckCard.source" size="small" />
              </button>

              <div
                v-if="exileActionOverlayIndex === index"
                class="modal-card-actions"
              >
                <BButton
                  type="is-light"
                  @click="
                    move({
                      fromZone: 'exile',
                      toZone: 'hand',
                      uuid: exile[index].deckCard.uuid,
                    })
                    exileActionOverlayIndex = -1
                  "
                >
                  Move to Hand
                </BButton>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <div class="level is-mobile" style="width: 100%">
            <div class="level-left">
              <div class="level-item">
                <BButton @click="exileModalIsShowing = false">
                  Close
                </BButton>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BModal>
  </div>
</template>

<script>
import get from 'lodash/get'
import { mapGetters, mapActions } from 'vuex'
import { ToastProgrammatic as Toast } from 'buefy'
import Card from '~/components/Card'

export default {
  auth: false,

  components: { Card },

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
    graveyardModalIsShowing: false,
    graveyardActionOverlayIndex: -1,
    exileModalIsShowing: false,
    exileActionOverlayIndex: -1,
    latestDragOffsets: { x: 0, y: 0 },
    currentDragCoordinates: { x: 0, y: 0 },
    draggingElement: null,
    draggingItem: null,
    draggedFromZone: null,
    hoveredZone: null,
    cardWidth: 75,
    isPressing: false,
    isDragging: false,
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
      turn: 'playtest/turn',
      life: 'playtest/life',
    }),

    handReversed() {
      return this.hand.slice().reverse()
    },

    cardHeight() {
      return this.cardWidth * 1.4
    },

    zoneStyle() {
      return { height: `${this.cardHeight + 18}px` }
    },
  },

  mounted() {
    window.addEventListener('resize', this.setAppropriateCardSize)
    this.setAppropriateCardSize()

    window.document.body.classList.add('no-refresh')
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.setAppropriateCardSize)

    window.document.body.classList.remove('no-refresh')
  },

  methods: {
    ...mapActions({
      build: 'playtest/build',
      draw: 'playtest/draw',
      shuffleLibrary: 'playtest/shuffleLibrary',
      move: 'playtest/move',
      tap: 'playtest/tap',
      dragItem: 'playtest/dragItem',
      nextTurn: 'playtest/nextTurn',
      bumpLife: 'playtest/bumpLife',
    }),

    setAppropriateCardSize() {
      if (window.innerWidth > 720) {
        this.cardWidth = 150
      } else {
        this.cardWidth = 75
      }
    },

    _tap(uuid) {
      return () => {
        if (this.isDragging) return
        this.tap(uuid)
      }
    },

    openLibraryModal() {
      if (this.isDragging) return
      this.libraryActionOverlayIndex = -1
      this.libraryCardsAreFaceUp = false
      this.libraryModalIsShowing = true
    },

    openGraveyardModal() {
      if (this.isDragging) return
      this.graveyardActionOverlayIndex = -1
      this.graveyardModalIsShowing = true
    },

    openExileModal() {
      if (this.isDragging) return
      this.exileActionOverlayIndex = -1
      this.exileModalIsShowing = true
    },

    _shuffleLibrary() {
      this.shuffleLibrary()
      Toast.open({ message: '🎲 library shuffled 🎲', type: 'is-success' })
    },

    startDragItem(event) {
      // See if we're on something draggable.
      const elWithData = event.path.find(node => get(node, 'dataset.dragInfo'))
      if (!elWithData) return

      this.isPressing = true
      const { zone, uuid } = JSON.parse(elWithData.dataset.dragInfo)
      const item = this[zone].find(item => item.deckCard.uuid === uuid)

      this.draggingElement = event.target
      this.draggingItem = item
      this.draggedFromZone = zone

      const x = event.touches ? event.touches[0].pageX : event.pageX
      const y = event.touches ? event.touches[0].pageY : event.pageY
      this.latestDragOffsets = {
        x: x - event.target.getBoundingClientRect().left,
        y: y - event.target.getBoundingClientRect().top,
      }

      this.currentDragCoordinates = {
        x: Math.max(0, x - this.latestDragOffsets.x),
        y: Math.max(52, y - this.latestDragOffsets.y),
      }
    },

    _dragItem(event) {
      if (!this.isPressing) {
        return
      }

      this.isDragging = true

      const x = event.touches ? event.touches[0].pageX : event.pageX
      const y = event.touches ? event.touches[0].pageY : event.pageY

      const hoveredZone = [
        // Determine what zone if any we're hovering over.
        'battlefield',
        'hand',
        'library',
        'commandZone',
        'graveyard',
        'exile',
      ].reduce((hoveredZone, zone) => {
        if (hoveredZone) return hoveredZone
        const el = document.querySelector(`.${zone}`)
        const box = el.getBoundingClientRect()
        if (
          box.x <= x &&
          x <= box.x + box.width &&
          box.y <= y &&
          y <= box.y + box.height
        ) {
          return zone
        }
        return null
      }, null)

      this.hoveredZone = hoveredZone

      this.currentDragCoordinates = {
        x: Math.max(0, x - this.latestDragOffsets.x),
        y: Math.max(52, y - this.latestDragOffsets.y),
      }
    },

    dropItem() {
      if (this.isDragging && this.hoveredZone) {
        this.move({
          fromZone: this.draggedFromZone,
          toZone: this.hoveredZone,
          uuid: this.draggingItem.deckCard.uuid,
          x: this.currentDragCoordinates.x,
          y: this.currentDragCoordinates.y,
        })
      }

      this.latestDragOffsets = { x: 0, y: 0 }
      this.currentDragCoordinates = { x: 0, y: 0 }
      this.draggingElement = null
      this.draggingItem = null
      this.draggedFromZone = null
      this.hoveredZone = null
      this.isPressing = false
      this.isDragging = false
    },

    styleFromItem(item, numItems, index) {
      if (item.x == null) return {}
      return {
        position: 'fixed',
        top: `${item.y}px`,
        left: `${item.x}px`,
        zIndex: numItems - index,
      }
    },

    handStyleFromItem(item, numItems, index) {
      const ratio = index / (numItems - 1)

      return { left: `calc(${ratio} * (100% - ${this.cardWidth}px))` }
    },
  },
}
</script>

<style>
.no-refresh {
  overscroll-behavior: none;
}
</style>

<style scoped>
.play-area {
  height: calc(100vh - 52px);
  display: flex;
  flex-direction: column;
  /* Disable text selection so our dragging around doesn't trigger anything weird. */
  user-select: none;
}

.battlefield {
  flex-grow: 1;
  position: relative;
}

.zone {
  display: flex;
  position: relative;
  border: 1px solid grey;
  border-radius: 4px;
  margin: 0.25rem;
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
.commandZone {
  min-width: 75px;
}

.hand-inner {
  width: 100%;
  position: relative;
}

.hand-card-wrapper {
  position: absolute;
  top: 0;
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
  outline: none;
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
  align-items: center;
  padding: 0.5rem;
  border-radius: 4.75% / 3.5%;
}

.battlefield-card-wrapper {
  position: absolute;
  transition: transform 150ms;
}

.battlefield-card-wrapper > button {
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
}

.tapped {
  transform: rotate(90deg);
}

.drag-dummy {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.75;
}

.hovered {
  background: #ffdd5750;
}

.battlefield-actions {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 999999;
  top: 52px;
  right: 0;
  padding: 0.5rem;
}

.battlefield-actions .life {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  font-family: monospace;
  font-weight: bold;
}
</style>
