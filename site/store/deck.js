import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import sortBy from 'lodash/sortBy'
import first from 'lodash/first'
import last from 'lodash/last'
import get from 'lodash/get'
import compact from 'lodash/compact'
import chunk from 'lodash/chunk'
import intersection from 'lodash/intersection'
import { ToastProgrammatic as Toast } from 'buefy'

function openToast({ message, type = 'is-success', position = 'is-bottom' }) {
  Toast.open({ message, type, position })
}

export const state = () => ({
  deck: null,
  owner: null,
  cardSuggestions: [],
  printings: {},
  bulkAddErrorMessages: [],
  usePurposeGroups: true,
  sortByCmc: true,
  prices: {},
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
      powerLevel: deck.powerLevel,
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

  printings(state, printings) {
    state.printings = printings
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

  updateThe99(state, the99) {
    state.deck = {
      ...state.deck,
      the99,
    }
  },

  bulkAddErrorMessages(state, messages) {
    state.bulkAddErrorMessages = messages
  },

  usePurposeGroups(state, value) {
    state.usePurposeGroups = value
  },

  sortByCmc(state, value) {
    state.sortByCmc = value
  },

  addPrice(state, price) {
    state.prices = {
      ...state.prices,
      [price.tcgplayerId]: price,
    }
  },

  addPrices(state, prices) {
    state.prices = {
      ...state.prices,
      ...prices,
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
    this.$router.replace(`/deck/${deck.slug}`)
  },

  async updatePowerLevel({ commit, state }, newPowerLevel) {
    const { data: deck } = await this.$axios.put(
      `/api/decks/${state.deck._id}`,
      {
        powerLevel: newPowerLevel,
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

    openToast({
      message: 'Successfully updated.',
    })
    commit('deckCompuPurposes', deck)
  },

  async getCardSuggestions({ commit }, query) {
    if ((query.nameLike || '').trim().length < 3) {
      return commit('cardSuggestions', [])
    }

    const {
      data: { cards },
    } = await this.$axios.get(`/api/cards`, { params: query })
    commit('cardSuggestions', cards)
  },

  async getPrintings({ commit }, { card, setNameFilter }) {
    const {
      data: { printings },
    } = await this.$axios.get(`/api/cards/printings`, {
      params: { name: card.name, setNameFilter },
    })
    commit('printings', { [card.name]: printings })
  },

  async addCommander(
    { commit, state, dispatch },
    { scryfallId, purposes, isFoil, name }
  ) {
    const { data: commander } = await this.$axios.post(
      `/api/decks/${state.deck._id}/commanders`,
      {
        commander: {
          scryfallId,
          purposes,
          isFoil,
        },
      }
    )

    openToast({
      message: `Added ${name} as commander.`,
    })
    commit('addCommander', commander)
    dispatch('getPricesForDeck')
  },

  async updateCommander(
    { commit, state, dispatch },
    { uuid, purposes, isFoil, scryfallId, name }
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

    openToast({
      message: `Updated ${name}.`,
    })
    commit('updateCommander', commander)
    dispatch('getPricesForDeck')
  },

  async deleteCommander({ commit, state }, uuid) {
    await this.$axios.delete(`/api/decks/${state.deck._id}/commanders/${uuid}`)
    openToast({
      message: `Removed commander.`,
      type: 'is-info',
    })
    commit('deleteCommander', uuid)
  },

  async addCard(
    { commit, state, dispatch },
    { scryfallId, purposes, count, isFoil, isConsideration, name }
  ) {
    try {
      const {
        data: { the99 },
      } = await this.$axios.post(`/api/decks/${state.deck._id}/the99`, {
        card: {
          scryfallId,
          purposes,
          isFoil,
          isConsideration,
        },
        count,
      })

      openToast({
        message: `Added ${name}.`,
      })
      commit('updateThe99', the99)
      dispatch('getPricesForDeck')
    } catch (e) {
      const message = get(e, 'response.data', '').startsWith(
        'Illegal duplicates'
      )
        ? `${name} already added`
        : `Error adding ${name}. Maybe try again?`
      openToast({
        message,
        type: 'is-danger',
      })
    }
  },

  async updateCard(
    { commit, state, dispatch },
    { uuid, purposes, isFoil, isConsideration, scryfallId, count, name }
  ) {
    try {
      const {
        data: { the99 },
      } = await this.$axios.put(`/api/decks/${state.deck._id}/the99/${uuid}`, {
        card: {
          scryfallId,
          isFoil,
          purposes,
          isConsideration,
        },
        count,
      })

      openToast({
        message: `Updated ${name}.`,
      })
      commit('updateThe99', the99)
      dispatch('getPricesForDeck')
    } catch (e) {
      const message = get(e, 'response.data', '').startsWith(
        'Illegal duplicates'
      )
        ? `${name} already added`
        : `Error adding ${name}. Maybe try again?`
      openToast({
        message,
        type: 'is-danger',
      })
    }
  },

  async deleteCard({ commit, state }, uuid) {
    const {
      data: { the99 },
    } = await this.$axios.delete(`/api/decks/${state.deck._id}/the99/${uuid}`)

    openToast({
      message: `Removed card.`,
      type: 'is-info',
    })
    commit('updateThe99', the99)
  },

  async bulkAdd({ commit, state, dispatch }, updates) {
    commit('bulkAddErrorMessages', [])
    try {
      const { data: deck } = await this.$axios.put(
        `/api/decks/${state.deck._id}/bulk`,
        {
          updates,
        }
      )
      openToast({
        message: `Successful bulk upload!`,
      })
      commit('deck', deck)
      dispatch('getPricesForDeck')
    } catch ({ response }) {
      if (!response || !response.data) {
        commit('bulkAddErrorMessages', [
          'Something went wrong. Please try again.',
        ])
      } else {
        commit('bulkAddErrorMessages', [
          ...get(response, 'data.missingCardInputs', []),
          ...get(response, 'data.commanderErrorMessages', []),
          ...get(response, 'data.the99ErrorMessages', []),
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

  setSortByCmc({ commit }, value) {
    commit('sortByCmc', value)
  },

  async deleteDeck({ state }) {
    await this.$axios.delete(`/api/decks/${state.deck._id}`)
    openToast({
      message: `Deleted ${state.deck.name || 'the deck'}.`,
    })
  },

  async getPriceForCard({ commit, state }, source) {
    if (!source || !source.tcgplayerId || state.prices[source.tcgplayerId])
      return

    const {
      data: { price },
    } = await this.$axios.get(`/api/prices/card/${source.tcgplayerId}`)
    commit('addPrice', price)
  },

  async getPricesForDeck({ commit, state }) {
    if (!state.deck) return

    const {
      data: { prices },
    } = await this.$axios.get(`/api/prices/deck/${state.deck._id}`)
    commit('addPrices', prices)
  },
}

export const getters = {
  user: state => state.auth.user,
  owner: state => state.owner,
  slug: state => state.deck.slug,
  iAmOwner: (state, getters, rootState) =>
    get(getters, 'owner._id', -1) === get(rootState, 'auth.user._id', -2),
  name: state => state.deck.name || 'Untitled deck',
  powerLevel: state => state.deck.powerLevel || 4,
  powerLevelDisplay: (state, { powerLevel }) => {
    switch (powerLevel) {
      case 1:
        return 'Super Jank'
      case 2:
        return 'Jank'
      case 3:
        return 'Jank/Casual'
      case 4:
        return 'Casual'
      case 5:
        return 'Casual/Focused'
      case 6:
        return 'Focused'
      case 7:
        return 'Focused/Optimized'
      case 8:
        return 'Optimized'
      case 9:
        return 'Optimized/Competitive'
      case 10:
        return 'Competitive'
    }
  },
  purpose: state => state.deck.purpose || 'No purpose',
  description: state => state.deck.description || 'No description',
  descriptionParagraphs: state =>
    (state.deck.description || 'No description').split('\n'),
  prices: state => state.prices,
  compuPurposes: state => state.deck.compuPurposes,
  commanders: state =>
    state.deck.commanders.map(c => ({ ...c, isCommander: true })),
  canAddCommander: state =>
    state.deck.commanders.length === 0 ||
    (state.deck.commanders.length === 1 &&
      state.deck.commanders[0].source.isPartner),
  cardSuggestions: state => state.cardSuggestions,
  printings: state => state.printings,
  usePurposeGroups: state => state.usePurposeGroups,
  sortByCmc: state => state.sortByCmc,
  suggestedPurposes: (state, { commanders, the99 }) =>
    sortBy(
      uniq([
        ...flatten([...commanders, ...the99].map(c => c.purposes)),
        'Card draw',
        'Ramp',
        'Single removal',
        'Board wipe',
      ])
    ),
  colorIdentity: (state, { commanders }) => {
    const colors = flatten(commanders.map(c => c.source.ci))
    return ['W', 'U', 'B', 'R', 'G'].filter(c => colors.includes(c))
  },
  the99: state => state.deck.the99.filter(c => !c.isConsideration),
  considerations: state => state.deck.the99.filter(c => c.isConsideration),

  bulkAddErrorMessages: state => state.bulkAddErrorMessages,

  cardGroupingsForThe99: (
    state,
    { usePurposeGroups, sortByCmc, commanders, the99, compuPurposeHashForThe99 }
  ) =>
    makeCardGroupings({
      usePurposeGroups,
      sortByCmc,
      commanders,
      cards: the99,
      compuPurposeHash: compuPurposeHashForThe99,
    }),

  cardGroupingsForConsiderations: (
    state,
    {
      usePurposeGroups,
      sortByCmc,
      considerations,
      compuPurposeHashForConsiderations,
    }
  ) =>
    makeCardGroupings({
      usePurposeGroups,
      sortByCmc,
      commanders: [],
      cards: considerations,
      compuPurposeHash: compuPurposeHashForConsiderations,
    }).filter(({ cards }) => cards.length), // Unlike mainboard, don't show groups with no cards.

  compuPurposeHashForThe99: (state, { commanders, the99, compuPurposes }) =>
    makeCompuPurposeHash({ commanders, cards: the99, compuPurposes }),
  compuPurposeHashForConsiderations: (
    state,
    { considerations, compuPurposes }
  ) =>
    makeCompuPurposeHash({
      commanders: [],
      cards: considerations,
      compuPurposes,
    }),

  compuPurposeHashForAll: (
    state,
    { compuPurposeHashForThe99, compuPurposeHashForConsiderations }
  ) => {
    return Object.entries(compuPurposeHashForConsiderations).reduce(
      (all, [title, cards]) => {
        return {
          ...all,
          [title]: [...(all[title] || []), ...cards],
        }
      },
      compuPurposeHashForThe99
    )
  },

  cardUuidToCompuPurposeTitles: (state, { compuPurposeHashForAll }) => {
    const map = {}
    Object.entries(compuPurposeHashForAll).forEach(([title, cards]) => {
      cards.forEach(card => {
        if (!map[card.uuid]) map[card.uuid] = []
        map[card.uuid].push(title)
      })
    })
    return map
  },

  deckColorIdentity: (state, { commanders }) => {
    return uniq(flatten(commanders.map(({ source }) => source.ci)))
  },

  cardUuidToIsLegal: (
    state,
    { commanders, the99, considerations, deckColorIdentity }
  ) => {
    function isDeckCardLegal(source) {
      return (
        intersection(source.ci, deckColorIdentity).length ===
          source.ci.length && source.isLegal
      )
    }

    function isCommanderLegal(source) {
      return source.isLegal && source.canBeCommander
    }

    const commanderHash = commanders.reduce((hash, { uuid, source }) => {
      return {
        ...hash,
        [uuid]: isCommanderLegal(source),
      }
    }, {})

    const otherHash = [...the99, ...considerations].reduce(
      (hash, { uuid, source }) => {
        return {
          ...hash,
          [uuid]: isDeckCardLegal(source),
        }
      },
      {}
    )

    return {
      ...commanderHash,
      ...otherHash,
    }
  },

  totalIllegalCards: (state, { cardUuidToIsLegal }) => {
    return Object.entries(cardUuidToIsLegal).filter(([, isLegal]) => !isLegal)
      .length
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
      uniq(
        compact(flatten([...commanders.map(getPower), ...the99.map(getPower)]))
      )
    )
  },

  toughnesses: (state, { commanders, the99 }) => {
    const getToughness = c => get(c, 'source.faces[0].toughness')
    return sortBy(
      uniq(
        compact(
          flatten([...commanders.map(getToughness), ...the99.map(getToughness)])
        )
      )
    )
  },

  loyalties: (state, { commanders, the99 }) => {
    const getLoyalty = c => get(c, 'source.faces[0].loyalty')
    return sortBy(
      uniq(
        compact(
          flatten([...commanders.map(getLoyalty), ...the99.map(getLoyalty)])
        )
      )
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

  numColors: (state, { commanders }) => {
    return [
      0,
      ...uniq(flatten(commanders.map(({ source }) => source.ci))).map(
        (_, index) => index + 1
      ),
    ]
  },

  numCards: (state, { commanders = [], the99 = [] }) =>
    commanders.length + the99.length,

  cmcArrayMinusLands: (state, { commanders = [], the99 = [] }) =>
    [...commanders, ...the99]
      .filter(
        ({
          source: {
            faces: [face0],
          },
        }) => !face0.types.includes('Land')
      )
      .map(card => get(card, 'source.cmc') || 0),

  averageCmc: (state, { cmcArrayMinusLands }) => {
    const avg = cmcArrayMinusLands.reduce(
      (avg, cmc) => avg + cmc / cmcArrayMinusLands.length,
      0
    )

    return Math.round(avg * 100) / 100
  },

  medianCmc: (state, { cmcArrayMinusLands }) => {
    const sorted = sortBy(cmcArrayMinusLands)

    const [chunk1 = [], chunk2 = []] = chunk(
      sorted,
      Math.round(sorted.length / 2)
    )
    if (!chunk1) return 0
    if (chunk1.length !== chunk2.length) return last(chunk1)
    return (last(chunk1) + first(chunk2)) / 2 || 0
  },

  castingCostPipCounts: (state, { commanders, the99 }) => {
    const costs = [...commanders, ...the99].map(card =>
      get(card, 'source.faces[0].manaCost', '')
    )

    let totalNumPips = 0
    const hash = costs.reduce(
      (acc, cost) => {
        cost
          .replace(/[^WUBRGC]/g, '')
          .split('')
          .forEach(pip => {
            acc[pip]++
            totalNumPips++
          })

        return acc
      },
      {
        W: 0,
        U: 0,
        B: 0,
        R: 0,
        G: 0,
        C: 0,
      }
    )

    Object.entries(hash).forEach(([pip, count]) => {
      if (!count) delete hash[pip]
      else hash[pip] = { count: hash[pip], ratio: hash[pip] / totalNumPips }
    })

    return hash
  },

  textExport: (state, { commanders, the99 }) => {
    function set(card) {
      if (!card.source.setCode) return ''

      let s = card.source.setCode
      if (card.source.multiverseId) {
        s += `:${card.source.multiverseId}`
      }
      return `(${s})`
    }

    return sortBy(
      [...commanders, ...the99].map(card =>
        [
          card.source.name,
          card.isCommander ? '*CMDR*' : '',
          card.isFoil ? ' *F*' : '',
          set(card),
          card.purposes.length ? `# ${card.purposes.join(', ')}` : '',
        ]
          .filter(s => s)
          .join(' ')
      ),
      line => {
        if (line.includes('*CMDR*')) {
          return ' ' + line
        }
        return line
      }
    )
      .reduce((cardLines, cardLine) => {
        if (cardLines.length === 0) return [cardLine]
        const lastCardLine = cardLines.pop()
        if (lastCardLine.replace(/^\d+[ ]/, '') === cardLine) {
          return [
            ...cardLines,
            `${+(/^(\d+)/.exec(lastCardLine) || ['', 1])[1] + 1} ${cardLine}`,
          ]
        }

        return [...cardLines, lastCardLine, cardLine]
      }, [])
      .join('\n')
  },

  deckPrice: (state, { commanders, the99, priceForCard }) => {
    const price = [...commanders, ...the99].reduce((total, card) => {
      return total + priceForCard(card)
    }, 0)

    return price.toFixed(2)
  },

  priceForCard: (state, { prices }) => {
    return function(card) {
      const { tcgplayerId } = card.source
      const { isFoil } = card
      const entry = prices[tcgplayerId]
      if (entry) {
        return isFoil ? +(entry.usdFoil || 0) : +(entry.usd || 0)
      }
      return 0
    }
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
function makeCardGroupings({
  usePurposeGroups,
  sortByCmc,
  commanders,
  cards,
  compuPurposeHash,
}) {
  const hashByCompuPurpose = usePurposeGroups ? compuPurposeHash : {}
  const cardNamesInCompuPurposeGroups = flatten(
    Object.values(compuPurposeHash)
  ).map(c => c.source.name)
  const [hashByPurpose, hashByType] = [...commanders, ...cards].reduce(
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
    return sortBy(
      hash[purpose],
      ...(sortByCmc
        ? ['source.cmc', 'source.name']
        : ['source.name', 'source.cmc'])
    ).reduce((cards, card) => {
      const lastCard = last(cards)
      if (lastCard && card.source.scryfallId === lastCard.source.scryfallId) {
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
    }, [])
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
}

// Hash of compuPurpose title => cards that match the rul, compuPurposeses, compuPurpos, compuPurposeses, compuPurposes.
//
function makeCompuPurposeHash({ commanders, cards, compuPurposes }) {
  return compuPurposes.reduce((hash, compuPurpose) => {
    hash[compuPurpose.title] = [...commanders, ...cards].filter(
      ({ source }) => {
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
                return (source.cmc === condition.value) === is
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
              case 'numcolors':
                return ((front.colors || []).length === condition.value) === is
              case 'name':
                return new RegExp(condition.value, 'i').test(source.name) === is
              case 'rules':
                return (
                  new RegExp(condition.value, 'i').test(
                    source.faces.map(({ oracleText }) => oracleText).join('\n')
                  ) === is
                )
              default:
                return false
            }
          })
        })
      }
    )
    return hash
  }, {})
}
