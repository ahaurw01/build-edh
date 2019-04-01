const _ = require('lodash')
const { Card, allCardFieldsGroup } = require('./models')

module.exports = {
  populateBulkInputSources,
  validateBulkInput,
}

const bulkInputToRegex = (input = '') =>
  new RegExp(`^${input.split('#')[0].trim()}$`, 'i')

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
 * Given a list of bulk updates, ensure that:
 *
 * - All given cards exist.
 */
async function validateBulkInput(ctx, next) {
  const foundCardNames = ctx.state.bulkInputSources.map(s => s.name)
  context.state.missingCardInputs = (ctx.request.body.updates || []).reduce(
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
