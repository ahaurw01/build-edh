import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'

export const state = () => ({
  deck: null,
  owner: null,
  cardSuggestions: [],
})

export const mutations = {
  deck(state, deck) {
    state.deck = deck
  },

  deckMeta(state, deck) {
    state.deck = {
      ...state.deck,
      name: deck.name,
      purpose: deck.purpose,
      description: deck.description,
    }
  },

  owner(state, owner) {
    state.owner = owner
  },

  cardSuggestions(state, cardSuggestions) {
    state.cardSuggestions = cardSuggestions
  },

  addCommander(state, commander) {
    state.deck = {
      ...state.deck,
      commanders: [...state.deck.commanders, commander],
    }
  },

  updateCommander(state, commander) {
    state.deck = {
      ...state.deck,
      commanders: state.deck.commanders.map(existingCommander => {
        if (existingCommander.uuid === commander.uuid) return commander
        return existingCommander
      }),
    }
  },

  deleteCommander(state, uuid) {
    state.deck = {
      ...state.deck,
      commanders: state.deck.commanders.filter(
        existingCommander => existingCommander.uuid !== uuid
      ),
    }
  },
}

export const actions = {
  async updateName({ commit, state }, newName) {
    const { data: deck } = await this.$axios.put(
      `/api/decks/${state.deck._id}`,
      {
        name: newName,
      }
    )
    commit('deckMeta', deck)
  },

  async updatePurpose({ commit, state }, newPurpose) {
    const { data: deck } = await this.$axios.put(
      `/api/decks/${state.deck._id}`,
      {
        purpose: newPurpose,
      }
    )
    commit('deckMeta', deck)
  },

  async updateDescription({ commit, state }, newDescription) {
    const { data: deck } = await this.$axios.put(
      `/api/decks/${state.deck._id}`,
      {
        description: newDescription,
      }
    )
    commit('deckMeta', deck)
  },

  async getCardSuggestions({ commit, state }, query) {
    if (!(query.nameLike || '').trim()) {
      return commit('cardSuggestions', [])
    }

    const {
      data: { cards },
    } = await this.$axios.get(`/api/cards`, { params: query })
    commit('cardSuggestions', cards)
  },

  async addCommander({ commit, state }, { scryfallId, purposes }) {
    const { data: commander } = await this.$axios.post(
      `/api/decks/${state.deck._id}/commanders`,
      {
        commander: {
          scryfallId,
          purposes,
        },
      }
    )

    commit('addCommander', commander)
  },

  async updateCommander(
    { commit, state },
    { uuid, purposes, isFoil, scryfallId }
  ) {
    const { data: commander } = await this.$axios.put(
      `/api/decks/${state.deck._id}/commanders/${uuid}`,
      {
        commander: {
          purposes,
          isFoil,
          scryfallId,
        },
      }
    )

    commit('updateCommander', commander)
  },

  async deleteCommander({ commit, state }, uuid) {
    await this.$axios.delete(`/api/decks/${state.deck._id}/commanders/${uuid}`)
    commit('deleteCommander', uuid)
  },
}

export const getters = {
  ownerUsername: state => state.owner.username,
  name: state => state.deck.name || 'Untitled deck',
  purpose: state => state.deck.purpose || 'No purpose',
  description: state => state.deck.description || 'No description',
  descriptionParagraphs: state =>
    (state.deck.description || 'No description').split('\n'),
  commanders: state => state.deck.commanders,
  canAddCommander: state =>
    state.deck.commanders.length === 0 ||
    (state.deck.commanders.length === 1 &&
      state.deck.commanders[0].source.isPartner),
  cardSuggestions: state => state.cardSuggestions,
  suggestedPurposes: (state, { commanders }) =>
    uniq([
      ...flatten(commanders.map(c => c.purposes)),
      'Card draw',
      'Ramp',
      'Mana rock',
      'Targeted removal',
      'Board wipe',
      'Utility',
    ]),
  colorIdentity: (state, { commanders }) => {
    const colors = flatten(commanders.map(c => c.source.ci))
    return ['W', 'U', 'B', 'R', 'G'].filter(c => colors.includes(c))
  },
  the99: state => state.deck.the99,
  canAddCard: (state, { commanders, the99 }) => {
    return (
      (commanders.length < 2 && the99.length < 99) ||
      (commanders.length === 2 && the99.length < 98)
    )
  },
}
