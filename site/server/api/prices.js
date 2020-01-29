const { Card, Price } = require('./models')
const { getPricesForProductIds } = require('../tcgplayer')

module.exports = {
  getCardPrice,
}

async function getCardPrice(ctx) {
  const { id } = ctx.params
  // See if we have one cached.
  const price = await Price.findOne({ card: id })
  if (price) {
    ctx.body = { price }
    return
  }

  const card = await Card.findById(id)
  if (!card || !card.tcgplayerId) {
    ctx.status = 404
    return
  }

  // Gives us a hash of tcgplayerId -> {usd: Number, usdFoil: Number}
  const prices = await getPricesForProductIds(card.tcgplayerId)

  ctx.body = {
    price: prices[card.tcgplayerId],
  }

  await Price.create({
    card: card._id,
    tcgplayerId: card.tcgplayerId,
    ...prices[card.tcgplayerId],
  })
}
