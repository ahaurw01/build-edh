export const state = () => ({
  deck: null,
  owner: null,
})

export const mutations = {
  deck(state, deck) {
    state.deck = deck
  },

  owner(state, owner) {
    state.owner = owner
  },
}

export const actions = {}

export const getters = {
  ownerUsername: state => state.owner.username,
  deckName: state => state.deck.name || 'Untitled deck',
}
