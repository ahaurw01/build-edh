const { Card, Price } = require('./models')
const { getPricesForProductIds } = require('../tcgplayer')

module.exports = {
  getCardPrice,
}

async function getCardPrice(ctx) {
  const { tcgplayerId } = ctx.params
  // See if we have one cached.
  let price = await Price.findOne({ tcgplayerId })
  if (price) {
    ctx.body = { price }
    return
  }

  const card = await Card.findOne({ tcgplayerId })
  if (!card) {
    ctx.status = 404
    return
  }

  // Gives us a hash of tcgplayerId -> {usd: Number, usdFoil: Number}
  const prices = await getPricesForProductIds(tcgplayerId)

  price = await Price.create({
    card,
    tcgplayerId: card.tcgplayerId,
    ...prices[tcgplayerId],
  })

  ctx.body = {
    price,
  }
}
