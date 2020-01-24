import get from 'lodash/get'

export const state = () => ({
  decks: null,
  user: null,
})

export const mutations = {
  decks(state, decks) {
    state.decks = decks
  },

  user(state, user) {
    state.user = user
  },
}

export const actions = {}

export const getters = {
  decks: state => state.decks,
  user: state => state.user,

  userIsMe: (state, { user }, { auth }) => {
    return get(user, '_id', -1) === get(auth, 'user._id', -2)
  },
}
