const { Card } = require('./models')

module.exports = {
  getCards,
}

async function getCards(ctx) {
  const {
    canBeCommander,
    nameLike,
    isLegal = true,
    cmc,
    ci,
    isPartner,
  } = ctx.query

  const problems = []
  if (!nameLike)
    problems.push({
      param: 'nameLike',
      message: 'nameLike is required',
    })

  if (problems.length) {
    ctx.status = 400
    ctx.body = problems
    return
  }

  const filters = { name: new RegExp(nameLike, 'i') }
  if (canBeCommander != null) filters.canBeCommander = canBeCommander
  if (isLegal != null) filters.isLegal = isLegal
  if (isPartner != null) filters.isPartner = isPartner

  const group = {
    ...Object.keys(Card.schema.paths).reduce((acc, key) => {
      acc[key] = { $first: `$${key}` }
      return acc
    }, {}),
    _id: '$name',
  }

  // const cards = await Card.find(filters, null, { limit: 10 }).exec()
  const cards = await Card.aggregate()
    .match(filters)
    .group(group)
    .limit(10)
    .exec()

  ctx.body = { cards }
}
