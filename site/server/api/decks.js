const { Deck } = require('./models')

module.exports = {
  createDeck,
  getDeck,
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
