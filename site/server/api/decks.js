const _ = require('lodash')
const uuid = require('uuid/v4')
const { Deck, Card } = require('./models')
const {
  parseBulkInputNumbers,
  populateBulkInputSources,
  populateCommanderSources,
  populateThe99Sources,
  validateBulkInput,
  validateCommanders,
  validateThe99,
  isBulkInputCommander,
  isBulkInputFoil,
  purposesFromBulkInput,
  sourceForInput,
} = require('./deck-validation')

module.exports = {
  ensureDeckOwner,
  createDeck,
  getDecksByOwner,
  getDeck,
  updateDeck,
  bulkUpdateDeckMiddlewares: [
    parseBulkInputNumbers,
    populateBulkInputSources,
    validateBulkInput,
    bulkUpdateDeckAssembly,
    populateCommanderSources,
    populateThe99Sources,
    validateCommanders,
    validateThe99,
    bulkUpdateValidationCheck,
    bulkUpdateSave,
    getDeck,
  ],
  addDeckCommander,
  updateDeckCommander,
  deleteDeckCommander,
  addDeckCardMiddlewares: [
    addDeckCardAssembly,
    populateCommanderSources,
    populateThe99Sources,
    validateThe99,
    addDeckCardValidationCheck,
    addDeckCardSave,
  ],
  updateDeckCardMiddlewares: [
    updateDeckCardAssembly,
    populateCommanderSources,
    populateThe99Sources,
    validateThe99,
    updateDeckCardValidationCheck,
    updateDeckCardSave,
  ],
  deleteDeckCardMiddlewares: [
    deleteDeckCardAssembly,
    populateCommanderSources,
    populateThe99Sources,
    validateThe99,
    deleteDeckCardSave,
  ],
  deleteDeck,
}

async function ensureDeckOwner(ctx, next) {
  const deck = await Deck.findOne({
    _id: ctx.params.id,
    owner: ctx.state.user._id,
  })
  if (deck) {
    ctx.state.deck = deck
    return next()
  } else {
    ctx.throw(403)
  }
}

async function createDeck(ctx) {
  const { user } = ctx.state
  const deck = new Deck({
    name: '',
    slug: Deck.makeSlug('untitled'),
    purpose: '',
    description: '',
    owner: user._id,
    createdAt: new Date(),
  })
  ctx.body = await deck.save()
}

async function getDecksByOwner(ctx) {
  const owner = ctx.query.ownerId || ctx.state.user._id
  const decks = await Deck.find({ owner })

  const commanderScryfallIds = _.flatten(
    decks.map(({ commanders }) => commanders)
  ).map(({ scryfallId }) => scryfallId)

  const sources = await Card.find({
    scryfallId: { $in: commanderScryfallIds },
  })

  ctx.body = decks.map(deck => ({
    ...deck.toJSON(),
    commanders: deck.commanders.map(commander => ({
      ...commander,
      source: _.find(sources, { scryfallId: commander.scryfallId }),
    })),
  }))
}

async function getDeck(ctx) {
  const slug = ctx.params.slug || _.get(ctx, 'state.deck.slug')
  let deck = await Deck.findOne({ slug })
  if (!deck) return (ctx.response.status = 404)

  deck = deck.toJSON()
  // Populate the card sources
  const scryfallIds = _.map(deck.commanders, 'scryfallId').concat(
    _.map(deck.the99, 'scryfallId')
  )
  const sources = await Card.find({
    scryfallId: { $in: scryfallIds },
  })
  deck.commanders = deck.commanders.map(commander => ({
    ...commander,
    source: _.find(sources, { scryfallId: commander.scryfallId }),
  }))
  deck.the99 = deck.the99.map(card => ({
    ...card,
    source: _.find(sources, { scryfallId: card.scryfallId }),
  }))

  ctx.body = deck
}

async function updateDeck(ctx) {
  const { name, purpose, description, compuPurposes } = ctx.request.body
  const { id } = ctx.params
  const owner = ctx.state.user._id
  const deck = await Deck.findOne({ _id: id, owner })
  if (!deck) return (ctx.response.status = 404)

  if (name != null && name !== deck.name) {
    deck.name = name
    deck.slug = Deck.makeSlug(name)
  }
  if (purpose != null) deck.purpose = purpose
  if (description != null) deck.description = description
  if (compuPurposes != null) deck.compuPurposes = compuPurposes

  await deck.save()
  ctx.body = deck
}

function bulkUpdateDeckAssembly(ctx, next) {
  const { updates = [] } = ctx.request.body
  const { deck } = ctx.state

  if (ctx.state.missingCardInputs.length) {
    ctx.status = 400
    ctx.body = _.pick(ctx.state, ['missingCardInputs'])
    return
  }

  // Construct new deck.
  deck.commanders = []
  // Considerations aren't part of bulk updates yet.
  deck.the99 = deck.the99.filter(card => card.isConsideration)
  updates.forEach(input => {
    const source = sourceForInput(input, ctx.state.bulkInputSources)
    const card = {
      scryfallId: source.scryfallId,
      uuid: uuid(),
      purposes: purposesFromBulkInput(input),
      isFoil: isBulkInputFoil(input) && source.existsInFoil,
    }

    ;(isBulkInputCommander(input) ? deck.commanders : deck.the99).push(card)
  })

  return next()
}

function bulkUpdateValidationCheck(ctx, next) {
  // If validation problem:
  // - Do not update the deck.
  // - Send 400.
  // - Send list of cards that don't exist.
  // - Send any deck validation message.
  if (
    ctx.state.missingCardInputs.length ||
    ctx.state.commanderErrorMessages.length ||
    ctx.state.the99ErrorMessages.length
  ) {
    ctx.status = 400
    ctx.body = _.pick(ctx.state, [
      'missingCardInputs',
      'commanderErrorMessages',
      'the99ErrorMessages',
    ])
  } else {
    return next()
  }
}

async function bulkUpdateSave(ctx, next) {
  const { deck } = ctx.state
  await deck.save()
  return next()
}

/*
POST
{
  commander: {
    scryfallId: <id>,
  }
}
*/
async function addDeckCommander(ctx) {
  const scryfallId = _.get(ctx.request, 'body.commander.scryfallId')
  ctx.assert(!!scryfallId, 400, 'Missing scryfallId')
  const purposes = _.get(ctx.request, 'body.commander.purposes', [])
  const isFoil = _.get(ctx.request, 'body.commander.isFoil', false)

  const { deck } = ctx.state
  const commander = {
    scryfallId,
    uuid: uuid(),
    purposes,
    isFoil,
  }
  deck.commanders.push(commander)
  await oldValidateCommanders(ctx)
  await deck.save()
  ctx.body = {
    ...commander,
    source: _.find(ctx.state.sources, { scryfallId: commander.scryfallId }),
  }
}

/*
PUT
{
  commander: {
    purposes: ['Card draw', 'Sac outlet'],
    isFoil: true,
    scryfallId: <id>
  }
}

*/
async function updateDeckCommander(ctx) {
  const { uuid } = ctx.params
  const { deck } = ctx.state

  const commander = _.find(deck.commanders, { uuid })
  ctx.assert(!!commander, 400, 'UUID not found')
  ctx.assert(ctx.request.body.commander, 400, 'No updates provided')

  const { isFoil, purposes, scryfallId } = ctx.request.body.commander

  if (isFoil != null) commander.isFoil = isFoil
  if (purposes != null) commander.purposes = purposes
  if (scryfallId != null) commander.scryfallId = scryfallId

  await oldValidateCommanders(ctx)
  await deck.save()
  ctx.body = {
    ...commander.toJSON(),
    source: _.find(ctx.state.sources, { scryfallId: commander.scryfallId }),
  }
}

async function deleteDeckCommander(ctx) {
  const { uuid } = ctx.params
  const { deck } = ctx.state
  ctx.assert(_.find(deck.commanders, { uuid }), 400, 'UUID not found')

  deck.commanders = _.reject(deck.commanders, { uuid })
  await oldValidateCommanders(ctx)
  await deck.save()
  ctx.status = 204
}

async function oldValidateCommanders(ctx) {
  const {
    deck: { commanders },
  } = ctx.state
  ctx.assert(
    commanders.length <= 2,
    400,
    'Cannot have more than two commanders'
  )
  ctx.assert(
    commanders.length <= 1 ||
      _(commanders)
        .map('scryfallId')
        .uniq()
        .value().length === 2,
    400,
    'Cannot have duplicate commanders'
  )

  const sources = await Card.find({
    scryfallId: { $in: _.map(commanders, 'scryfallId') },
  })
  ctx.state.sources = ctx.state.sources || []
  ctx.state.sources = ctx.state.sources.concat(sources)

  ctx.assert(commanders.length === sources.length, 400, 'Card not found')

  if (commanders.length <= 1) return

  ctx.assert(
    _.every(sources, 'isPartner'),
    400,
    'Both commanders must have partner'
  )
  ctx.assert(
    (!sources[0].partnerWith && !sources[1].partnerWith) ||
      sources[0].partnerWith === sources[1].name,
    400,
    'Mismatch of specified partner'
  )
}

/*
POST
{
  card: {
    scryfallId: <id>,
    purposes: ['Chair art', 'Card draw'],
    isFoil: false
  },
  count: 1
}
*/
async function addDeckCardAssembly(ctx, next) {
  const scryfallId = _.get(ctx.request, 'body.card.scryfallId')
  ctx.assert(!!scryfallId, 400, 'Missing scryfallId')
  const purposes = _.get(ctx.request, 'body.card.purposes', [])
  const isFoil = _.get(ctx.request, 'body.card.isFoil', false)
  const isConsideration = _.get(ctx.request, 'body.card.isConsideration', false)
  const count = _.get(ctx.request, 'body.count', 1)

  const { deck } = ctx.state
  const cards = '_'
    .repeat(count)
    .split('')
    .map(() => ({
      scryfallId,
      uuid: uuid(),
      purposes,
      isFoil,
      isConsideration,
    }))
  deck.the99 = [...deck.the99, ...cards]

  return next()
}

async function addDeckCardValidationCheck(ctx, next) {
  // If validation problem:
  // - Do not update the deck.
  // - Send 400.
  // - Send error messages.
  if (
    ctx.state.addDeckCardErrorMessages.length ||
    ctx.state.the99ErrorMessages.length
  ) {
    ctx.status = 400
    ctx.body = [
      ...ctx.state.addDeckCardErrorMessages,
      ...ctx.state.the99ErrorMessages,
    ].join(', ')
  } else {
    return next()
  }
}

async function addDeckCardSave(ctx, next) {
  const { deck } = ctx.state

  await deck.save()

  ctx.body = {
    the99: deck.the99.map(card => ({
      ...card.toJSON(),
      source: _.find(ctx.state.the99Sources, {
        scryfallId: card.scryfallId,
      }),
    })),
  }

  return next()
}

/*
PUT
{
  card: {
    purposes: ['Card draw', 'Sac outlet'],
    isFoil: true,
    scryfallId: <id>
  },
  count: 1
}

*/
async function updateDeckCardAssembly(ctx, next) {
  const { uuid: cardUuid } = ctx.params
  const { deck } = ctx.state

  const existingCard = _.find(deck.the99, { uuid: cardUuid })
  ctx.assert(!!existingCard, 400, 'UUID not found')
  ctx.assert(ctx.request.body.card, 400, 'No updates provided')

  const {
    isFoil = false,
    isConsideration = false,
    purposes = [],
    scryfallId,
  } = ctx.request.body.card
  const count = _.get(ctx.request, 'body.count', 1)

  const the99WithoutUpdatingCard = deck.the99.filter(card => {
    // Drop all cards that are identical in nature to the one being updated.
    const matchesUpdatingCard =
      card.scryfallId === existingCard.scryfallId &&
      card.isFoil === existingCard.isFoil &&
      card.isConsideration === existingCard.isConsideration
    return !matchesUpdatingCard
  })

  const cards = '_'
    .repeat(count)
    .split('')
    .map(() => ({
      scryfallId,
      uuid: uuid(),
      purposes,
      isFoil,
      isConsideration,
    }))
  deck.the99 = [...the99WithoutUpdatingCard, ...cards]

  return next()
}

async function updateDeckCardValidationCheck(ctx, next) {
  // If validation problem:
  // - Do not update the deck.
  // - Send 400.
  // - Send error messages.
  if (
    ctx.state.addDeckCardErrorMessages.length ||
    ctx.state.the99ErrorMessages.length
  ) {
    ctx.status = 400
    ctx.body = [
      ...ctx.state.addDeckCardErrorMessages,
      ...ctx.state.the99ErrorMessages,
    ].join(', ')
  } else {
    return next()
  }
}

async function updateDeckCardSave(ctx, next) {
  const { deck } = ctx.state

  await deck.save()

  ctx.body = {
    the99: deck.the99.map(card => ({
      ...card.toJSON(),
      source: _.find(ctx.state.the99Sources, {
        scryfallId: card.scryfallId,
      }),
    })),
  }

  return next()
}

/*
DELETE /decks/:id/the99/:uuid
*/
async function deleteDeckCardAssembly(ctx, next) {
  const { uuid } = ctx.params
  const { deck } = ctx.state
  const deletingCard = _.find(deck.the99, { uuid })
  ctx.assert(deletingCard, 400, 'UUID not found')

  deck.the99 = deck.the99.filter(card => {
    // Drop all cards that are identical in nature to the one being deleted.
    const matchesUpdatingCard =
      card.scryfallId === deletingCard.scryfallId &&
      card.isFoil === deletingCard.isFoil
    return !matchesUpdatingCard
  })
  return next()
}

async function deleteDeckCardSave(ctx, next) {
  const { deck } = ctx.state
  await deck.save()

  ctx.body = {
    the99: deck.the99.map(card => ({
      ...card.toJSON(),
      source: _.find(ctx.state.the99Sources, {
        scryfallId: card.scryfallId,
      }),
    })),
  }

  return next()
}

async function deleteDeck(ctx) {
  const { id } = ctx.params
  const deck = await Deck.findById(id)
  if (!deck) return (ctx.response.status = 404)

  if (deck.owner.toString() !== ctx.state.user._id)
    return (ctx.response.status = 403)

  await deck.remove()
  ctx.response.status = 204
}
