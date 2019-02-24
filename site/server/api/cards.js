const { Card } = require('./models')

module.exports = {
  getCards,
}

const group = {
  ...Object.keys(Card.schema.paths).reduce((acc, key) => {
    key = key.split('.')[0]
    acc[key] = { $first: `$${key}` }
    return acc
  }, {}),
  _id: '$name',
}

async function getCards(ctx) {
  let { nameLike = '', canBeCommander, isLegal, isPartner } = ctx.query

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

  // const cards = await Card.find(filters, null, { limit: 10 }).exec()
  const cards = await Card.aggregate()
    .match(filters)
    .group(group)
    .limit(10)
    .exec()

  ctx.body = { cards }
}
