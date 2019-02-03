export const state = () => ({
  decks: null,
})

export const mutations = {
  decks(state, decks) {
    state.decks = decks
  },
}

export const actions = {}

export const getters = {
  decks: state => state.decks,
}
