import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import sortBy from 'lodash/sortBy'
import last from 'lodash/last'
import get from 'lodash/get'

export const state = () => ({
  deck: null,
  owner: null,
  cardSuggestions: [],
  bulkAddErrorMessages: [],
  usePurposeGroups: true,
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

  deckCompuPurposes(state, deck) {
    state.deck = {
      ...state.deck,
      compuPurposes: deck.compuPurposes,
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

  usePurposeGroups(state, value) {
    state.usePurposeGroups = value
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

  async updateCompuPurposes({ commit, state }, newCompuPurposes) {
    const { data: deck } = await this.$axios.put(
      `/api/decks/${state.deck._id}`,
      {
        compuPurposes: newCompuPurposes,
      }
    )
    commit('deckCompuPurposes', deck)
  },

  async getCardSuggestions({ commit }, query) {
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

  setUsePurposeGroups({ commit }, value) {
    commit('usePurposeGroups', value)
  },
}

export const getters = {
  ownerUsername: state => state.owner.username,
  name: state => state.deck.name || 'Untitled deck',
  purpose: state => state.deck.purpose || 'No purpose',
  description: state => state.deck.description || 'No description',
  descriptionParagraphs: state =>
    (state.deck.description || 'No description').split('\n'),
  compuPurposes: state => state.deck.compuPurposes,
  commanders: state => state.deck.commanders,
  canAddCommander: state =>
    state.deck.commanders.length === 0 ||
    (state.deck.commanders.length === 1 &&
      state.deck.commanders[0].source.isPartner),
  cardSuggestions: state => state.cardSuggestions,
  usePurposeGroups: state => state.usePurposeGroups,
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

  // Assemble groupings of cards based on their assigned purposes or type.
  // [
  //  {purpose: 'Card draw', cards: [...]},
  //  {purpose: 'Ramp', cards: [...]},
  // ]
  //
  // Cards are deduplicated with a `count` property (if canHaveMultiple).
  //
  // We give automatic groups based on dominant card type if no purposes are present.
  //
  // Look at state.usePurposeGroups to determine grouping strategy.
  //
  cardGroupings: ({ usePurposeGroups }, { the99, compuPurposeHash }) => {
    const hashByCompuPurpose = usePurposeGroups ? compuPurposeHash : {}
    const cardNamesInCompuPurposeGroups = flatten(
      Object.values(compuPurposeHash)
    ).map(c => c.source.name)
    const [hashByPurpose, hashByType] = the99.reduce(
      ([purposeHash, typeHash], card) => {
        const { purposes } = card
        if (purposes.length && usePurposeGroups) {
          purposes.forEach(purpose => {
            purposeHash[purpose] = [...(purposeHash[purpose] || []), card]
          })
        } else if (
          !usePurposeGroups ||
          !cardNamesInCompuPurposeGroups.includes(card.source.name)
        ) {
          const type = dominantCardType(card)
          typeHash[type] = [...(typeHash[type] || []), card]
        }

        return [purposeHash, typeHash]
      },
      [{}, {}]
    )

    function makeGroupedCards(hash, purpose) {
      return sortBy(hash[purpose], 'source.cmc', 'source.name').reduce(
        (cards, card) => {
          const lastCard = last(cards)
          if (lastCard && card.source.name === lastCard.source.name) {
            lastCard.count += 1
          } else {
            cards = [
              ...cards,
              {
                ...card,
                count: 1,
              },
            ]
          }

          return cards
        },
        []
      )
    }

    const groupings = [
      ...Object.keys(hashByPurpose).map(purpose => ({
        purpose,
        cards: makeGroupedCards(hashByPurpose, purpose),
      })),
      ...Object.keys(hashByCompuPurpose).map(purpose => ({
        purpose,
        isCompuPurposeGroup: true,
        cards: makeGroupedCards(hashByCompuPurpose, purpose),
      })),
      ...Object.keys(hashByType).map(purpose => ({
        purpose,
        isAutomaticGroup: true,
        cards: makeGroupedCards(hashByType, purpose),
      })),
    ]

    return sortBy(groupings, [
      grouping =>
        -1 * grouping.cards.reduce((count, card) => count + card.count, 0),
      'purpose',
    ])
  },

  // Hash of compuPurpose title => cards that match the rules.
  //
  compuPurposeHash: (state, { the99, compuPurposes }) => {
    return compuPurposes.reduce((hash, compuPurpose) => {
      hash[compuPurpose.title] = the99.filter(({ source }) => {
        // Check that the card's details matches the rules and conditions.
        // If "is" is true, we are checking that at least one condition of the
        // rule matches the card.
        // If "is" is false, we are checking that every condition of the rule
        // does not match the card.
        //
        return compuPurpose.rules.every(({ field, conditions, is }) => {
          const method = is ? 'some' : 'every'
          return conditions[method](condition => {
            const [front = {}, back = {}] = source.faces
            switch (field) {
              case 'type':
                return (
                  [...(front.types || []), ...(back.types || [])].includes(
                    condition.value
                  ) === is
                )
              case 'subtype':
                return (
                  [
                    ...(front.subTypes || []),
                    ...(back.subTypes || []),
                  ].includes(condition.value) === is
                )
              case 'supertype':
                return (
                  [
                    ...(front.superTypes || []),
                    ...(back.superTypes || []),
                  ].includes(condition.value) === is
                )
              case 'cmc':
                return source.cmc === condition.value
              case 'power':
                return (
                  [front.power || -999, back.power || -999].includes(
                    condition.value
                  ) === is
                )
              case 'toughness':
                return (
                  [front.toughness || -999, back.toughness || -999].includes(
                    condition.value
                  ) === is
                )
              case 'loyalty':
                return (
                  [front.loyalty || -999, back.loyalty || -999].includes(
                    condition.value
                  ) === is
                )
              case 'color': {
                let colors = [...(front.colors || []), ...(back.colors || [])]
                if (!colors.length) colors = ['C']
                return colors.includes(condition.value) === is
              }
              default:
                return false
            }
          })
        })
      })
      return hash
    }, {})
  },

  subtypes: (state, { commanders, the99 }) => {
    const getSubtypes = c => get(c, 'source.faces[0].subTypes')
    return sortBy(
      uniq(flatten([...commanders.map(getSubtypes), ...the99.map(getSubtypes)]))
    )
  },

  convertedManaCosts: (state, { commanders, the99 }) => {
    const getCMC = c => get(c, 'source.cmc')
    return sortBy(
      uniq(flatten([...commanders.map(getCMC), ...the99.map(getCMC)]))
    )
  },

  powers: (state, { commanders, the99 }) => {
    const getPower = c => get(c, 'source.faces[0].power')
    return sortBy(
      uniq(flatten([...commanders.map(getPower), ...the99.map(getPower)]))
    )
  },

  toughnesses: (state, { commanders, the99 }) => {
    const getToughness = c => get(c, 'source.faces[0].toughness')
    return sortBy(
      uniq(
        flatten([...commanders.map(getToughness), ...the99.map(getToughness)])
      )
    )
  },

  loyalties: (state, { commanders, the99 }) => {
    const getLoyalty = c => get(c, 'source.faces[0].loyalty')
    return sortBy(
      uniq(flatten([...commanders.map(getLoyalty), ...the99.map(getLoyalty)]))
    )
  },

  colors: (state, { commanders }) => {
    const commanderColorIdentities = flatten(
      commanders.map(({ source }) => source.ci)
    )
    return [
      ...[
        { key: 'W', value: 'White' },
        { key: 'U', value: 'Blue' },
        { key: 'B', value: 'Black' },
        { key: 'R', value: 'Red' },
        { key: 'G', value: 'Green' },
      ].filter(({ key }) => commanderColorIdentities.includes(key)),
      { key: 'C', value: 'Colorless' },
    ]
  },
}

/**
 * Provide the card's dominant card type. Cards can have multiple types. Give the most "important" one.
 *
 * @param {Object} card
 *
 * @returns {string} The card's dominant type. One of:
 *                   - land
 *                   - creature
 *                   - artifact
 *                   - enchantment
 *                   - planeswalker
 *                   - instant
 *                   - sorcery
 */
function dominantCardType(card) {
  const typesInOrderOfDominance = [
    'Instant',
    'Sorcery',
    'Planeswalker',
    'Land',
    'Creature',
    'Artifact',
    'Enchantment',
  ]

  const types = get(card, 'source.faces[0].types', [])

  return typesInOrderOfDominance.filter(t => types.includes(t))[0] || 'Other'
}
