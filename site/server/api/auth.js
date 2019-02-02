const _ = require('lodash')
const jwt = require('jsonwebtoken')

module.exports = {
  login,
}

function login(ctx, next) {
  if (
    _.get(ctx, 'request.body.username') === 'aaron' &&
    _.get(ctx, 'request.body.password') === 'password'
  ) {
    ctx.body = {
      token: jwt.sign({ userId: 123 }, 'secret'),
    }
  } else {
    return next()
  }
}
