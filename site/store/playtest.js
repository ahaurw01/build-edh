import shuffle from 'lodash/shuffle'

export const state = () => ({
  deck: null,
  // Zones:
  library: [],
  hand: [],
  graveyard: [],
  exile: [],
  battlefield: [],
  commandZone: [],
})

export const mutations = {
  deck(state, deck) {
    state.deck = deck
  },

  library(state, library) {
    state.library = library
  },

  hand(state, hand) {
    state.hand = hand
  },

  graveyard(state, graveyard) {
    state.graveyard = graveyard
  },

  exile(state, exile) {
    state.exile = exile
  },

  battlefield(state, battlefield) {
    state.battlefield = battlefield
  },

  commandZone(state, commandZone) {
    state.commandZone = commandZone
  },
}

export const actions = {
  build({ getters, dispatch, commit }) {
    commit(
      'library',
      getters.deck.the99.map(deckCard => ({ deckCard }))
    )
    commit(
      'commandZone',
      getters.deck.commanders.map(deckCard => ({ deckCard }))
    )
    dispatch('shuffleLibrary')
  },

  shuffleLibrary({ commit, getters }) {
    commit('library', shuffle(getters.library))
  },

  draw({ getters, dispatch }, howMany) {
    // Take first <howMany> cards from library and prepend them to the hand.
    // Commit new library, commit new hand.
    const hand = getters.hand.slice()
    const library = getters.library.slice()
    for (let i = 0; i < howMany && library.length; i++) {
      dispatch('move', { fromZone: 'library', toZone: 'hand' })
      hand.unshift(library.shift())
    }
  },

  move({ commit, getters }, { item, fromZone, toZone, x, y }) {
    const fromZoneArray = getters[fromZone]
    const toZoneArray = getters[toZone]

    if (!item) {
      item = fromZoneArray[0]
    }

    if (!item) return

    const newFromZoneArray = fromZoneArray.filter(
      o => o.deckCard.uuid !== item.deckCard.uuid
    )
    const newToZoneArray = [
      { ...item, x, y },
      ...(fromZone === toZone ? newFromZoneArray : toZoneArray),
    ]

    commit(fromZone, newFromZoneArray)
    commit(toZone, newToZoneArray)
  },

  tap({ commit, getters }, item) {
    commit(
      'battlefield',
      getters.battlefield.map(existingItem => {
        if (existingItem.deckCard.uuid === item.deckCard.uuid) {
          return { ...existingItem, tapped: !existingItem.tapped }
        }
        return existingItem
      })
    )
  },

  dragItem({ commit, getters }, { zone, item, x, y }) {
    commit(
      zone,
      getters[zone].map(existingItem => {
        if (existingItem.deckCard.uuid === item.deckCard.uuid) {
          return { ...item, x, y }
        }
        return { ...existingItem, x: null, y: null }
      })
    )
  },

  // dropItem() {},
}

export const getters = {
  name: state => state.deck.name || 'Untitled deck',
  deck: state => state.deck,
  library: state => state.library,
  hand: state => state.hand,
  graveyard: state => state.graveyard,
  exile: state => state.exile,
  battlefield: state => state.battlefield,
  commandZone: state => state.commandZone,
}
