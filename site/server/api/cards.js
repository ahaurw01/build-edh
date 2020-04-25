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

  const filters = { ignore: false }
  if (nameLike)
    filters.searchName = new RegExp(Card.normalizeSearchName(nameLike), 'i')
  if (canBeCommander != null) filters.canBeCommander = canBeCommander
  if (isLegal != null) filters.isLegal = isLegal
  if (isPartner != null) filters.isPartner = isPartner
  if (ci != null) filters.$expr = { $setIsSubset: ['$ci', ci] }

  let cards = await Card.aggregate()
    .match(filters)
    // Sort the basic lands to the top first, since those are obvious choices.
    // Sort by edhrec rank next to bubble popular cards to the top.
    // E.g. "sol" should definitely give us Sol Ring.
    // Then sort by ascending searchDemerits.
    // A card with searchDemerits indicates that we don't prefer to have it be the
    // top result when searching, but it needs to be available if it's the only
    // printing we'd find.
    // We assign searchDemerits for being foil only, promo printing, etc.
    // Then all things equal, sort by latest release date so we don't prefer
    // Alpha cards, for example.
    .sort({
      isNonSnowBasicLand: -1,
      edhrecRank: 1,
      searchDemerits: 1,
      releaseDate: -1,
    })
    .group(allCardFieldsGroup)
    .sort({
      isNonSnowBasicLand: -1,
      edhrecRank: 1,
    })
    .limit(20)
    .exec()

  ctx.body = { cards }
}

async function getPrintings(ctx) {
  const { name, setNameFilter } = ctx.query

  ctx.assert(name, 400, 'No name provided')

  const query = { name, ignore: false }
  if (setNameFilter)
    query.setName = {
      $regex: new RegExp(
        (setNameFilter || '').replace(/[^\w\d\s:]/g, '').replace(/\s+/g, ' '),
        'i'
      ),
    }

  ctx.body = { printings: await Card.find(query).limit(20) }
}
