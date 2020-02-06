import shuffle from 'lodash/shuffle'
import get from 'lodash/get'

export const state = () => ({
  deck: null,
  // Zones:
  library: [],
  hand: [],
  graveyard: [],
  exile: [],
  battlefield: [],
  commandZone: [],
  life: 40,
  turn: 0,
  tokenSuggestions: [],
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

  turn(state, turn) {
    state.turn = turn
  },

  life(state, life) {
    state.life = life
  },

  tokenSuggestions(state, tokenSuggestions) {
    state.tokenSuggestions = tokenSuggestions
  },
}

export const actions = {
  build({ getters, dispatch, commit }) {
    commit(
      'library',
      getters.the99WithoutConsiderations.map(deckCard => ({ deckCard }))
    )
    commit(
      'commandZone',
      getters.deck.commanders.map(deckCard => ({ deckCard }))
    )
    commit('hand', [])
    commit('graveyard', [])
    commit('exile', [])
    commit('battlefield', [])
    commit('life', 40)
    commit('turn', 0)
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

  move({ commit, getters }, { uuid, fromZone, toZone, x, y }) {
    const fromZoneArray = getters[fromZone]
    const toZoneArray = getters[toZone]
    let item

    if (!uuid) {
      item = fromZoneArray[0]
    } else {
      item = fromZoneArray.find(item => item.deckCard.uuid === uuid)
    }

    if (!item) return

    const newFromZoneArray = fromZoneArray.filter(o => o !== item)
    const newToZoneArray = [
      { ...item, x, y },
      ...(fromZone === toZone ? newFromZoneArray : toZoneArray),
    ]

    commit(fromZone, newFromZoneArray)
    commit(toZone, newToZoneArray)
  },

  tap({ commit, getters }, uuid) {
    commit(
      'battlefield',
      getters.battlefield.map(existingItem => {
        if (existingItem.deckCard.uuid === uuid) {
          return { ...existingItem, tapped: !existingItem.tapped }
        }
        return existingItem
      })
    )
  },

  untapAll({ commit, getters }) {
    commit(
      'battlefield',
      getters.battlefield.map(item => ({
        ...item,
        tapped: false,
      }))
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

  nextTurn({ commit, getters, dispatch }) {
    dispatch('untapAll')
    dispatch('draw', 1)
    commit('turn', getters.turn + 1)
  },

  bumpLife({ commit, getters }, diff) {
    commit('life', getters.life + diff)
  },

  async searchForTokens({ commit }, searchTerm) {
    searchTerm = searchTerm.trim()
    if (searchTerm.length < 2) return
    try {
      const { data } = await this.$axios.get(
        `https://api.scryfall.com/cards/search`,
        {
          params: {
            q: `is:token name:${searchTerm}`,
          },
        }
      )
      if (data.data) {
        commit(
          'tokenSuggestions',
          data.data.map(scryfallCard => ({
            name: scryfallCard.name,
            imageUris: get(
              scryfallCard,
              'image_uris',
              get(scryfallCard, 'card_faces[0].image_uris')
            ),
            oracleText: get(
              scryfallCard,
              'oracle_text',
              get(scryfallCard, 'card_faces[0].oracle_text', '')
            ),
            existsInNonFoil: true,
          }))
        )
      }
    } catch (e) {
      // Swallow error
    }
  },

  createTokens({ commit, getters }, { token, count }) {
    let coord = 50
    const items = '.'
      .repeat(count)
      .split('')
      .map(() => ({
        deckCard: {
          uuid: Math.random(),
          source: token,
        },
        x: (coord += 10),
        y: coord,
      }))

    commit('battlefield', [...getters.battlefield, ...items.reverse()])
  },
}

export const getters = {
  name: state => state.deck.name || 'Untitled deck',
  deck: state => state.deck,
  the99WithoutConsiderations: state =>
    state.deck.the99.filter(c => !c.isConsideration),
  library: state => state.library,
  hand: state => state.hand,
  graveyard: state => state.graveyard,
  exile: state => state.exile,
  battlefield: state => state.battlefield,
  commandZone: state => state.commandZone,
  turn: state => state.turn,
  life: state => state.life,
  tokenSuggestions: state => state.tokenSuggestions,
}
