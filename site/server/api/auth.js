const bcrypt = require('bcrypt')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const { User } = require('./models')
const jwtSecret = 'secret'

module.exports = {
  login,
  register,
  me,
}

async function login(ctx, next) {
  const username = _.get(ctx, 'request.body.username')
  const password = _.get(ctx, 'request.body.password')
  const user = await User.findOne({ username })
  if (!user) return next()
  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return next()

  ctx.body = {
    token: jwt.sign(user.safeProps(), jwtSecret),
  }
}

async function register(ctx, next) {
  const username = _.get(ctx, 'request.body.username', '').trim()
  const password = _.get(ctx, 'request.body.password')
  if (!username || !password) {
    return ctx.throw(400, 'Invalid data')
  }

  const existingUsers = await User.find({ username })
  if (existingUsers.length) {
    return ctx.throw(400, 'User already exists')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username, passwordHash })
  await user.save()
  ctx.body = {
    token: jwt.sign(user.safeProps(), jwtSecret),
  }
}

function me(ctx) {
  ctx.body = { user: ctx.state.user }
}
