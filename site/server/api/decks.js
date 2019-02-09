const _ = require('lodash')
const uuid = require('uuid/v4')
const { Deck, Card } = require('./models')

module.exports = {
  ensureDeckOwner,
  createDeck,
  getMyDecks,
  getDeck,
  updateDeck,
  addDeckCommander,
  updateDeckCommander,
  deleteDeckCommander,
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
  const deck = await Deck.findById(id)
  if (!deck) ctx.response.status = 404
  else ctx.body = deck
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

  const { deck } = ctx.state
  const subdoc = {
    scryfallId,
    uuid: uuid(),
    purposes: [],
    isFoil: false,
  }
  deck.commanders.push(subdoc)
  await validateCommanders(ctx)
  await deck.save()
  ctx.body = subdoc
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

  await validateCommanders(ctx)
  await deck.save()
  ctx.body = commander
}

async function deleteDeckCommander(ctx) {
  const { uuid } = ctx.params
  const { deck } = ctx.state
  ctx.assert(_.find(deck.commanders, { uuid }), 400, 'UUID not found')

  deck.commanders = _.reject(deck.commanders, { uuid })
  await validateCommanders(ctx)
  await deck.save()
  ctx.status = 204
}

async function validateCommanders(ctx) {
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

  const cards = await Card.find({
    scryfallId: { $in: _.map(commanders, 'scryfallId') },
  })

  ctx.assert(commanders.length === cards.length, 400, 'Card not found')
  ctx.assert(_.every(cards, 'canBeCommander'), 400, 'Ineligible commander')

  if (commanders.length <= 1) return

  ctx.assert(
    _.every(cards, 'isPartner'),
    400,
    'Both commanders must have partner'
  )
  ctx.assert(
    (!cards[0].partnerWith && !cards[1].partnerWith) ||
      cards[0].partnerWith === cards[1].name,
    400,
    'Mismatch of specified partner'
  )
}
