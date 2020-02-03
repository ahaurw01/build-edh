export const state = () => ({
  deck: null,
})

export const mutations = {
  deck(state, deck) {
    state.deck = deck
  },
}

export const actions = {}

export const getters = {
  name: state => state.deck.name || 'Untitled deck',
}
