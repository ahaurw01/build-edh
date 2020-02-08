const _ = require('lodash')
const { Card } = require('./models')

const bulkInputToNameRegex = (input = '') =>
  new RegExp(
    `^${input
      .split('#')[0]
      .replace(/[*](cmdr|f)[*]/gi, '')
      .replace(/[(].*?[)]/i, '')
      .trim()}$`,
    'i'
  )

const isBulkInputCommander = (input = '') =>
  /\*cmdr\*/i.test(input.split('#')[0])

const isBulkInputFoil = (input = '') => /\*f\*/i.test(input.split('#')[0])

const setInfoFromBulkInput = (input = '') => {
  const match = /[(](.*?)[)]/.exec(input.split('#')[0])
  if (!match) return { setCode: null, multiverseId: null }

  const parts = match[1].split(':')
  const setCode = parts[0].toLowerCase()
  const multiverseId = parts[1] ? +parts[1] : null

  return { setCode, multiverseId }
}

const purposesFromBulkInput = (input = '') =>
  _((input.split('#')[1] || '').split(','))
    .map(p => p.trim())
    .compact()
    .uniq()
    .value()

const sourceForInput = (input = '', sources) => {
  const regexp = bulkInputToNameRegex(input)
  const { setCode, multiverseId } = setInfoFromBulkInput(input)
  return sources.find(source => {
    return (
      regexp.test(source.name) &&
      (setCode ? source.setCode === setCode : true) &&
      (multiverseId ? source.multiverseId === multiverseId : true)
    )
  })
}

module.exports = {
  parseBulkInputNumbers,
  populateBulkInputSources,
  populateCommanderSources,
  populateThe99Sources,
  validateBulkInput,
  validateCommanders,
  validateThe99,
  bulkInputToNameRegex,
  isBulkInputCommander,
  isBulkInputFoil,
  setInfoFromBulkInput,
  purposesFromBulkInput,
  sourceForInput,
}

/**
 * Turns number prefixes into repeat entries.
 */
function parseBulkInputNumbers(ctx, next) {
  ctx.request.body.updates = (ctx.request.body.updates || []).reduce(
    (acc, cur) => {
      const line = cur.trim()
      if (!line) return acc
      const numRegexp = /^(\d+)[xX]?\s*/
      const numCheck = numRegexp.exec(line)
      const num = numCheck ? numCheck[1] : 1

      return [...acc, ..._.times(num, () => line.replace(numRegexp, ''))]
    },
    []
  )
  return next()
}

/**
 * Sets ctx.state.bulkInputSources.
 */
async function populateBulkInputSources(ctx, next) {
  ctx.state.bulkInputSources = await Card.findWithNames(
    (ctx.request.body.updates || []).map(input => {
      const { setCode, multiverseId } = setInfoFromBulkInput(input)
      return {
        nameRegex: bulkInputToNameRegex(input),
        setCode,
        multiverseId,
      }
    })
  )

  return next()
}

/**
 * Sets ctx.state.commanderSources.
 */
async function populateCommanderSources(ctx, next) {
  const {
    deck: { commanders },
  } = ctx.state

  ctx.state.commanderSources = await Card.find({
    scryfallId: { $in: _.map(commanders, 'scryfallId') },
  })

  return next()
}

/**
 * Sets ctx.state.the99Sources.
 */
async function populateThe99Sources(ctx, next) {
  const {
    deck: { the99 },
  } = ctx.state

  ctx.state.the99Sources = await Card.find({
    scryfallId: { $in: _.map(the99, 'scryfallId') },
  })

  return next()
}

/**
 * Given a list of bulk updates, ensure that:
 *
 * - All given cards exist.
 *
 * Sets ctx.state.missingCardInputs
 */
function validateBulkInput(ctx, next) {
  const foundCardNames = ctx.state.bulkInputSources.map(s => s.name)
  ctx.state.missingCardInputs = (ctx.request.body.updates || []).reduce(
    (acc, cur) => {
      const regexp = bulkInputToNameRegex(cur)
      if (!_.find(foundCardNames, name => regexp.test(name))) {
        acc.push(cur)
      }
      return acc
    },
    []
  )
  return next()
}

/**
 * Perform feasibility checks.
 * Assumes the deck has already been updated but not saved.
 * Assumes you've populated commander sources.
 *
 * Sets ctx.state.commanderErrorMessages.
 */
function validateCommanders(ctx, next) {
  const {
    deck: { commanders },
    commanderSources: sources,
  } = ctx.state

  ctx.state.commanderErrorMessages = []

  if (commanders.length > 2) {
    ctx.state.commanderErrorMessages.push(
      'Cannot have more than two commanders'
    )
  }

  if (
    commanders.length === 2 &&
    _(sources)
      .map('name')
      .uniq()
      .value().length === 1
  ) {
    ctx.state.commanderErrorMessages.push('Cannot have duplicate commanders')
  }

  if (commanders.length === 2 && !_.every(sources, 'isPartner')) {
    ctx.state.commanderErrorMessages.push('Both commanders must have partner')
  }

  if (
    commanders.length === 2 &&
    (sources[0].partnerWith || sources[1].partnerWith) &&
    sources[0].partnerWith !== sources[1].name
  ) {
    ctx.state.commanderErrorMessages.push('Mismatch of specified partner')
  }

  return next()
}

/**
 * Perform feasibility checks.
 * Assumes the deck has already been updated but not saved.
 * Assumes you've populated commander sources.
 * Assumes you've populated the 99 sources.
 *
 * Sets ctx.state.the99ErrorMessages.
 */
function validateThe99(ctx, next) {
  const {
    deck: { commanders, the99 },
  } = ctx.state

  ctx.state.the99ErrorMessages = []
  ctx.state.addDeckCardErrorMessages = []

  const allSources = [...ctx.state.commanderSources, ...ctx.state.the99Sources]
  const allCardsWithSources = [...commanders, ...the99].map(card => ({
    ...card,
    source: _.find(allSources, { scryfallId: card.scryfallId }),
  }))

  allCardsWithSources.forEach(card => {
    if (!card.source) {
      ctx.state.addDeckCardErrorMessages.push('Card not found')
    }
  })
  const commanderNames = ctx.state.commanderSources.map(s => s.name)
  const the99Names = ctx.state.the99Sources.map(s => s.name)

  if (_.intersection(commanderNames, the99Names).length) {
    ctx.state.addDeckCardErrorMessages.push('Cannot add commander to the 99')
  }

  if (ctx.state.addDeckCardErrorMessages.length) return next()

  const badDuplicates = _(allCardsWithSources)
    .filter(c => !c.source.canHaveMultiple)
    .groupBy('source.name')
    .filter(cards => cards.length > 1)
    .value()

  if (badDuplicates.length > 0) {
    ctx.state.the99ErrorMessages.push(
      `Illegal duplicates: ${badDuplicates
        .map(dupes => dupes[0].source.name)
        .join(', ')}`
    )
  }

  return next()
}
