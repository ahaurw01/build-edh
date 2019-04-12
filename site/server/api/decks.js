const _ = require('lodash')
const uuid = require('uuid/v4')
const { Deck, Card } = require('./models')
const {
  populateBulkInputSources,
  populateCommanderSources,
  populateThe99Sources,
  validateBulkInput,
  validateCommanders,
  validateThe99,
  isBulkInputCommander,
  purposesFromBulkInput,
  scryfallIdForInput,
} = require('./deck-validation')

module.exports = {
  ensureDeckOwner,
  createDeck,
  getMyDecks,
  getDeck,
  updateDeck,
  bulkUpdateDeckMiddlewares: [
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
  addDeckCard,
  updateDeckCard,
  deleteDeckCard,
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
    purpose: '',
    description: '',
    owner: user._id,
    createdAt: new Date(),
  })
  ctx.body = await deck.save()
}

async function getMyDecks(ctx) {
  const owner = ctx.state.user._id
  const decks = await Deck.find({ owner })
  ctx.body = decks
}

async function getDeck(ctx) {
  const { id } = ctx.params
  let deck = await Deck.findById(id)
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
  const { name, purpose, description } = ctx.request.body
  const { id } = ctx.params
  const owner = ctx.state.user._id
  const updates = {}
  if (name != null) updates.name = name
  if (purpose != null) updates.purpose = purpose
  if (description != null) updates.description = description

  const deck = await Deck.findOneAndUpdate({ _id: id, owner }, updates, {
    new: true,
  })
  if (!deck) ctx.response.status = 404
  else ctx.body = deck
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
  updates.forEach(input => {
    const card = {
      scryfallId: scryfallIdForInput(input, ctx.state.bulkInputSources),
      uuid: uuid(),
      purposes: purposesFromBulkInput(input),
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
  ctx.assert(_.every(sources, 'canBeCommander'), 400, 'Ineligible commander')

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
  }
}
*/
async function addDeckCard(ctx) {
  const scryfallId = _.get(ctx.request, 'body.card.scryfallId')
  ctx.assert(!!scryfallId, 400, 'Missing scryfallId')
  const purposes = _.get(ctx.request, 'body.card.purposes', [])
  const isFoil = _.get(ctx.request, 'body.card.isFoil', false)

  const { deck } = ctx.state
  const card = {
    scryfallId,
    uuid: uuid(),
    purposes,
    isFoil,
  }
  deck.the99.push(card)
  await oldValidateThe99(ctx)
  await deck.save()
  ctx.body = {
    ...card,
    source: _.find(ctx.state.sources, { scryfallId: card.scryfallId }),
  }
}

/*
PUT
{
  card: {
    purposes: ['Card draw', 'Sac outlet'],
    isFoil: true,
    scryfallId: <id>
  }
}

*/
async function updateDeckCard(ctx) {
  const { uuid } = ctx.params
  const { deck } = ctx.state

  const card = _.find(deck.the99, { uuid })
  ctx.assert(!!card, 400, 'UUID not found')
  ctx.assert(ctx.request.body.card, 400, 'No updates provided')

  const { isFoil, purposes, scryfallId } = ctx.request.body.card

  if (isFoil != null) card.isFoil = isFoil
  if (purposes != null) card.purposes = purposes
  if (scryfallId != null) card.scryfallId = scryfallId

  await oldValidateThe99(ctx)
  await deck.save()
  ctx.body = {
    ...card.toJSON(),
    source: _.find(ctx.state.sources, { scryfallId: card.scryfallId }),
  }
}

/*
DELETE /decks/:id/the99/:uuid
*/
async function deleteDeckCard(ctx) {
  const { uuid } = ctx.params
  const { deck } = ctx.state
  ctx.assert(_.find(deck.the99, { uuid }), 400, 'UUID not found')

  deck.the99 = _.reject(deck.the99, { uuid })
  await oldValidateThe99(ctx)
  await deck.save()
  ctx.status = 204
}

async function oldValidateThe99(ctx) {
  const {
    deck: { commanders, the99 },
  } = ctx.state
  ctx.assert(
    (commanders.length < 2 && the99.length <= 99) ||
      (commanders.length === 2 && the99.length <= 98),
    400,
    commanders.length < 2
      ? 'Cannot have more than 99 cards'
      : 'Cannot have more than 98 cards with two commanders'
  )

  const sources = await Card.find({
    scryfallId: { $in: _.map(commanders.concat(the99), 'scryfallId') },
  })
  ctx.state.sources = ctx.state.sources || []
  ctx.state.sources = ctx.state.sources.concat(sources)

  const uniqueScryfallIds = _.uniq(
    _.map([...commanders, ...the99], 'scryfallId')
  )
  const uniqueScryfallIdsFound = _.uniq(_.map(sources, 'scryfallId'))
  ctx.assert(
    uniqueScryfallIds.length === uniqueScryfallIdsFound.length,
    400,
    'Card not found'
  )

  const badDuplicates = _(the99)
    .map(card => ({
      ...card,
      source: _.find(sources, { scryfallId: card.scryfallId }),
    }))
    .filter(c => !c.source.canHaveMultiple)
    .groupBy('source.name')
    .filter(cards => cards.length > 1)
    .value()

  ctx.assert(
    badDuplicates.length === 0,
    400,
    'Cannot add multiples of this card'
  )

  const commanderNames = commanders
    .map(c => _.find(sources, { scryfallId: c.scryfallId }))
    .map(s => s.name)
  const the99Names = the99
    .map(c => _.find(sources, { scryfallId: c.scryfallId }))
    .map(s => s.name)
  ctx.assert(
    _.intersection(commanderNames, the99Names).length === 0,
    400,
    'Cannot add commander to the 99'
  )
}
