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
  if (nameLike)
    filters.searchName = new RegExp(Card.normalizeSearchName(nameLike), 'i')
  if (canBeCommander != null) filters.canBeCommander = canBeCommander
  if (isLegal != null) filters.isLegal = isLegal
  if (isPartner != null) filters.isPartner = isPartner
  if (ci != null) filters.$expr = { $setIsSubset: ['$ci', ci] }

  // Use these filters to make a best guess of what somebody is looking for.
  // Don't grab the mystery booster print. Otherwise that would be the print for everything.
  // Don't grab promos, since those are often the last reprint.
  // Don't grab full art, since those are often basics that cost more and people aren't using.
  // Exclude certain sets that aren't typically recognizable.
  // To the best of my knowledge this won't exclude any cards outright.
  // That's the intention at least.
  filters.isPromo = false
  filters.isFullArt = false
  filters.setName = {
    $nin: Card.SETS_WE_PROB_DONT_WANT,
  }

  let cards = await Card.aggregate()
    .match(filters)
    .sort({ releaseDate: 'desc' })
    .group(allCardFieldsGroup)
    .limit(20)
    .exec()

  cards = _.sortBy(cards, ({ name: { length } }) => length)

  ctx.body = { cards }
}

async function getPrintings(ctx) {
  const { name, setNameFilter } = ctx.query

  ctx.assert(name, 400, 'No name provided')

  const query = { name }
  if (setNameFilter)
    query.setName = {
      $regex: new RegExp(
        (setNameFilter || '').replace(/[^\w\d\s:]/g, '').replace(/\s+/g, ' '),
        'i'
      ),
    }

  ctx.body = { printings: await Card.find(query).limit(20) }
}
