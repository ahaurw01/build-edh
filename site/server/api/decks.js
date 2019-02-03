const { Deck } = require('./models')

module.exports = {
  createDeck,
  getDeck,
  updateDeck,
}

async function createDeck(ctx) {
  const { user } = ctx.state
  const deck = new Deck({
    name: '',
    purpose: '',
    owner: user._id,
    createdAt: new Date(),
  })
  ctx.body = await deck.save()
}

async function getDeck(ctx) {
  const { id } = ctx.params
  const deck = await Deck.findById(id)
  if (!deck) ctx.response.status = 404
  else ctx.body = deck
}

async function updateDeck(ctx) {
  const { name, purpose } = ctx.request.body
  const { id } = ctx.params
  const owner = ctx.state.user._id
  const updates = {}
  if (name != null) updates.name = name
  if (purpose != null) updates.purpose = purpose

  const deck = await Deck.findOneAndUpdate({ _id: id, owner }, updates, {
    new: true,
  })
  if (!deck) ctx.response.status = 404
  else ctx.body = deck
}
