const { Card, allCardFieldsGroup } = require('./models')

module.exports = {
  getCards,
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

  const cards = await Card.aggregate()
    .match(filters)
    .group(allCardFieldsGroup)
    .limit(10)
    .exec()

  ctx.body = { cards }
}
