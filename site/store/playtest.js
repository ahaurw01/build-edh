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

  draw({ dispatch }, howMany) {
    // Take first <howMany> cards from library and prepend them to the hand.
    for (let i = 0; i < howMany; i++) {
      dispatch('move', { fromZone: 'library', toZone: 'hand' })
    }
  },

  move({ commit, getters }, { uuid, fromZone, toZone, x, y, position }) {
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
    commit(fromZone, newFromZoneArray)

    if (!item.isToken || toZone === 'battlefield') {
      const newItem = { ...item }
      if (x != null) item.x = x
      if (y != null) item.y = y
      if (position == null) position = 0
      if (position === -1) position = toZoneArray.length
      const arrayToSplice = fromZone === toZone ? newFromZoneArray : toZoneArray

      const newToZoneArray = [
        ...arrayToSplice.slice(0, position),
        newItem,
        ...arrayToSplice.slice(position),
      ]

      commit(toZone, newToZoneArray)
    }
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
          data.data
            .map(scryfallCard => {
              if (scryfallCard.name.includes(' // ')) return null
              return {
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
              }
            })
            .filter(c => c)
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
        isToken: true,
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
