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
}

export const actions = {
  async updateName({ commit, state }, newName) {
    const { data: deck } = await this.$axios.put(
      `/api/decks/${state.deck._id}`,
      {
        name: newName,
      }
    )
    commit('deck', deck)
  },

  async updatePurpose({ commit, state }, newPurpose) {
    const { data: deck } = await this.$axios.put(
      `/api/decks/${state.deck._id}`,
      {
        purpose: newPurpose,
      }
    )
    commit('deck', deck)
  },

  async updateDescription({ commit, state }, newDescription) {
    const { data: deck } = await this.$axios.put(
      `/api/decks/${state.deck._id}`,
      {
        description: newDescription,
      }
    )
    commit('deck', deck)
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
  suggestedPurposes: state =>
    uniq([
      ...flatten(state.deck.commanders.map(c => c.purposes)),
      'Card draw',
      'Ramp',
      'Mana rock',
      'Targeted removal',
      'Board wipe',
      'Utility',
    ]),
}
