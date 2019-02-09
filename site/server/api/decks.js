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
  const { deck } = ctx.state

  ctx.assert(!!scryfallId, 400, 'Mising scryfallId')

  // Can never have more than 2 commanders.
  ctx.assert(deck.commanders.length < 2, 400, 'Already two commanders')

  const [newCommander, existingCommanders] = await Promise.all([
    Card.findOne({ scryfallId }),
    deck.commanders.length
      ? Card.find({
          scryfallId: { $in: [_.map(deck.commanders, 'scryfallId')] },
        })
      : [],
  ])

  // Enforce ability to be a commander.
  ctx.assert(newCommander.canBeCommander, 400, 'Not a commander')

  async function saveWithNewCommander() {
    const subdoc = {
      scryfallId,
      uuid: uuid(),
      purposes: [],
      isFoil: false,
    }
    deck.commanders.push(subdoc)
    await deck.save()
    ctx.body = subdoc
  }

  if (existingCommanders.length === 0) {
    return saveWithNewCommander()
  }

  // Both must be a partner..
  ctx.assert(
    existingCommanders[0].isPartner && newCommander.isPartner,
    400,
    'Both commanders must have partner'
  )

  // There cannot be a mismatch of partnerWith.
  ctx.assert(
    existingCommanders[0].partnerWith
      ? existingCommanders[0].partnerWith === newCommander.name
      : !newCommander.partnerWith,
    400,
    'Mismatch of specified partner'
  )

  return saveWithNewCommander()
}

/*
PUT
{
  commanders: [
    {
      purposes: ['Card draw', 'Sac outlet'],
      isFoil: true,
      scryfallId: <id>
    }
  ]
}

*/
async function updateDeckCommander(ctx) {}

async function deleteDeckCommander(ctx) {}
