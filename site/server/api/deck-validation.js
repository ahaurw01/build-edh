const _ = require('lodash')
const { Card, allCardFieldsGroup } = require('./models')

module.exports = {
  populateBulkInputSources,
  populateCommanderSources,
  populateThe99Sources,
  validateBulkInput,
  validateCommanders,
  validateThe99,
}

const bulkInputToRegex = (input = '') =>
  new RegExp(`^${input.split('#')[0].trim()}$`, 'i')

/**
 * Sets ctx.state.bulkInputSources.
 */
async function populateBulkInputSources(ctx, next) {
  ctx.state.bulkInputSources = await Card.aggregate()
    .match({
      name: {
        $in: (ctx.request.body.updates || []).map(bulkInputToRegex),
      },
    })
    .group(allCardFieldsGroup)
    .exec()
  await next()
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

  await next()
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

  await next()
}

/**
 * Given a list of bulk updates, ensure that:
 *
 * - All given cards exist.
 *
 * Sets ctx.state.missingCardInputs
 */
async function validateBulkInput(ctx, next) {
  const foundCardNames = ctx.state.bulkInputSources.map(s => s.name)
  ctx.state.missingCardInputs = (ctx.request.body.updates || []).reduce(
    (acc, cur) => {
      const regexp = bulkInputToRegex(cur)
      if (!_.find(foundCardNames, name => regexp.test(name))) {
        acc.push(cur)
      }
      return acc
    },
    []
  )
  await next()
}

/**
 * Perform feasibility checks.
 * Assumes the deck has already been updated but not saved.
 * Assumes you've populated commander sources.
 *
 * Sets ctx.state.commanderErrorMessages.
 */
async function validateCommanders(ctx, next) {
  const {
    deck: { commanders },
  } = ctx.state

  ctx.state.commanderErrorMessages = []

  if (commanders.length > 2) {
    ctx.state.commanderErrorMessages.push(
      'Cannot have more than two commanders'
    )
  }

  if (
    _(ctx.state.commanderSources)
      .map('name')
      .uniq()
      .value().length === 2
  ) {
    ctx.state.commanderErrorMessages.push('Cannot have duplicate commanders')
  }

  if (!_.every(ctx.state.commanderSources, 'canBeCommander')) {
    ctx.state.commanderErrorMessages.push('Ineligible commander')
  }

  if (
    commanders.length === 2 &&
    !_.every(ctx.state.commanderSources, 'isPartner')
  ) {
    ctx.state.commanderErrorMessages.push('Both commanders must have partner')
  }

  if (
    commanders.length === 2 &&
    (sources[0].partnerWith || sources[1].partnerWith) &&
    sources[0].partnerWith !== sources[1].name
  ) {
    ctx.state.commanderErrorMessages.push('Mismatch of specified partner')
  }

  await next()
}

/**
 * Perform feasibility checks.
 * Assumes the deck has already been updated but not saved.
 * Assumes you've populated commander sources.
 * Assumes you've populated the 99 sources.
 *
 * Sets ctx.state.the99ErrorMessages.
 */
async function validateThe99(ctx, next) {
  const {
    deck: { commanders, the99 },
  } = ctx.state

  ctx.state.the99ErrorMessages = []

  if (commanders.length + the99.length > 100) {
    ctx.state.the99ErrorMessages.push('Cannot have more than 100 cards total.')
  }

  const allSources = [...ctx.state.commanderSources, ...ctx.state.the99Sources]
  const badDuplicates = _([...commanders, ...the99])
    .map(card => ({
      ...card,
      source: _.find(allSources, { scryfallId: card.scryfallId }),
    }))
    .filter(c => !c.source.canHaveMultiple)
    .groupBy('source.name')
    .filter(cards => cards.length > 1)
    .value()
  if (badDuplicates.length > 0) {
    ctx.state.the99ErrorMessages.push(`Illegal duplicates`)
  }

  await next()
}
