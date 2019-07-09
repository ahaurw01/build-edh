import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import sortBy from 'lodash/sortBy'
import last from 'lodash/last'

export const state = () => ({
  deck: null,
  owner: null,
  cardSuggestions: [],
  bulkAddErrorMessages: [],
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

  addCard(state, card) {
    state.deck = {
      ...state.deck,
      the99: [...state.deck.the99, card],
    }
  },

  updateCard(state, card) {
    state.deck = {
      ...state.deck,
      the99: state.deck.the99.map(existingCard => {
        if (existingCard.uuid === card.uuid) return card
        return existingCard
      }),
    }
  },

  deleteCard(state, uuid) {
    state.deck = {
      ...state.deck,
      the99: state.deck.the99.filter(
        existingCard => existingCard.uuid !== uuid
      ),
    }
  },

  bulkAddErrorMessages(state, messages) {
    state.bulkAddErrorMessages = messages
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

  async addCard({ commit, state }, { scryfallId, purposes }) {
    const { data: card } = await this.$axios.post(
      `/api/decks/${state.deck._id}/the99`,
      {
        card: {
          scryfallId,
          purposes,
        },
      }
    )

    commit('addCard', card)
  },

  async updateCard({ commit, state }, { uuid, purposes, isFoil, scryfallId }) {
    const { data: card } = await this.$axios.put(
      `/api/decks/${state.deck._id}/the99/${uuid}`,
      {
        card: {
          scryfallId,
          isFoil,
          purposes,
        },
      }
    )

    commit('updateCard', card)
  },

  async deleteCard({ commit, state }, uuid) {
    await this.$axios.delete(`/api/decks/${state.deck._id}/the99/${uuid}`)
    commit('deleteCard', uuid)
  },

  async bulkAdd({ commit, state }, updates) {
    commit('bulkAddErrorMessages', [])
    try {
      const { data: deck } = await this.$axios.put(
        `/api/decks/${state.deck._id}/bulk`,
        {
          updates,
        }
      )
      commit('deck', deck)
    } catch ({ response }) {
      if (!response || !response.data) {
        commit('bulkAddErrorMessages', [
          'Something went wrong. Please try again.',
        ])
      } else {
        commit('bulkAddErrorMessages', [
          ...response.data.missingCardInputs,
          ...response.data.commanderErrorMessages,
          ...response.data.the99ErrorMessages,
        ])
      }
    }
  },

  resetBulkAddErrorMessages({ commit }) {
    commit('bulkAddErrorMessages', [])
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
  bulkAddErrorMessages: state => state.bulkAddErrorMessages,

  // Assemble groupings of cards based on their assigned purposes.
  // [
  //  {purpose: 'Card draw', cards: [...]},
  //  {purpose: 'Ramp', cards: [...]},
  // ]
  //
  // Cards are deduplicated with a `count` property (if canHaveMultiple).
  //
  cardGroupingsByPurpose: (state, { the99 }) => {
    const hashByPurpose = the99.reduce((hash, card) => {
      let { purposes } = card
      if (purposes.length === 0) {
        purposes = ['Other']
      }
      purposes.forEach(purpose => {
        hash[purpose] = [...(hash[purpose] || []), card]
      })

      return hash
    }, {})

    const groupings = Object.keys(hashByPurpose).map(purpose => ({
      purpose,
      cards: sortBy(hashByPurpose[purpose], 'source.name').reduce(
        (cards, card, index) => {
          const lastCard = last(cards)
          if (lastCard && card.source.name === lastCard.source.name) {
            lastCard.count += 1
          } else {
            cards = [...cards, { ...card, count: 1 }]
          }

          return cards
        },
        []
      ),
    }))

    return sortBy(groupings, [
      grouping =>
        -1 * grouping.cards.reduce((count, card) => count + card.count, 0),
      'purpose',
    ])
  },
}
