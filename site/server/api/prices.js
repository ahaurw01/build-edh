const _ = require('lodash')
const { Card, Deck, Price } = require('./models')
const { getPricesForProductIds } = require('../tcgplayer')
const {
  populateCommanderSources,
  populateThe99Sources,
} = require('./deck-validation')

module.exports = {
  getCardPrice,
  getDeckPricesMiddlewares: [
    getDeck,
    populateCommanderSources,
    populateThe99Sources,
    getPricesForAllSources,
  ],
}

async function getCardPrice(ctx) {
  const tcgplayerId = Number(ctx.params.tcgplayerId)
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
    tcgplayerId: card.tcgplayerId,
    ...prices[tcgplayerId],
  })

  ctx.body = {
    price,
  }
}

async function getDeck(ctx, next) {
  const { deckId } = ctx.params
  if (!deckId) {
    return ctx.throw(404)
  }

  const deck = await Deck.findById(deckId)
  if (!deck) {
    return ctx.throw(404)
  }

  // Drop cards that are only considerations.
  deck.the99 = deck.the99.filter(c => !c.isConsideration)

  ctx.state.deck = deck
  return next()
}

async function getPricesForAllSources(ctx) {
  const tcgplayerIds = _([
    ...ctx.state.commanderSources,
    ...ctx.state.the99Sources,
  ])
    .map('tcgplayerId')
    .compact()
    .uniq()
    .value()

  const cachedPrices = await Price.find({ tcgplayerId: { $in: tcgplayerIds } })
  const tcgplayerIdsOutstanding = _.difference(
    tcgplayerIds,
    cachedPrices.map(({ tcgplayerId }) => tcgplayerId)
  )

  // Gives us a hash of tcgplayerId -> {usd: Number, usdFoil: Number}
  const fetchedPricesObj = tcgplayerIdsOutstanding.length
    ? await getPricesForProductIds(tcgplayerIdsOutstanding)
    : {}

  const fetchedPrices = Object.entries(fetchedPricesObj).map(([, val]) => val)

  if (fetchedPrices.length) {
    await Price.create(fetchedPrices)
  }

  ctx.body = {
    prices: {
      ...fetchedPricesObj,
      ...cachedPrices.reduce(
        (prices, price) => ({
          ...prices,
          [price.tcgplayerId]: price,
        }),
        {}
      ),
    },
  }
}
