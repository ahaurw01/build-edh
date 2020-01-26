const _ = require('lodash')
const { Card, allCardFieldsGroup } = require('./models')

module.exports = {
  getCards,
  getPrintings,
}

async function getCards(ctx) {
  let {
    nameLike = '',
    canBeCommander,
    isLegal,
    isPartner,
    'ci[]': ci,
  } = ctx.query
  if (ci && typeof ci === 'string') {
    ci = [ci]
  }

  nameLike = nameLike.trim()

  if (canBeCommander === 'true') canBeCommander = true
  if (canBeCommander === 'false') canBeCommander = false

  if (isLegal === 'true') isLegal = true
  if (isLegal === 'false') isLegal = false

  if (isPartner === 'true') isPartner = true
  if (isPartner === 'false') isPartner = false

  const filters = {}
  if (nameLike) filters.name = new RegExp(nameLike, 'i')
  if (canBeCommander != null) filters.canBeCommander = canBeCommander
  if (isLegal != null) filters.isLegal = isLegal
  if (isPartner != null) filters.isPartner = isPartner
  if (ci != null) filters.$expr = { $setIsSubset: ['$ci', ci] }

  let cards = await Card.aggregate()
    .match(filters)
    .group(allCardFieldsGroup)
    .limit(20)
    .exec()

  cards = _.sortBy(cards, ({ name: { length } }) => length)

  ctx.body = { cards }
}

const basicLandCache = {}

async function getPrintings(ctx) {
  const { name } = ctx.query

  ctx.assert(name, 400, 'No name provided')

  if (basicLandCache[name]) ctx.body = { printings: basicLandCache[name] }
  else ctx.body = { printings: await Card.find({ name }) }

  if (['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'].indexOf(name) > -1)
    basicLandCache[name] = ctx.body.printings
}
