const bcrypt = require('bcrypt')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const DiscordOauth2 = require('discord-oauth2')
const { User } = require('./models')
const { baseURL, DISCORD_CLIENT_SECRET } = require('../../nuxt.config.js')

const jwtSecret = 'secret'

module.exports = {
  login,
  register,
  me,
  discordLogin,
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

async function register(ctx) {
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
  ctx.body = ctx.state.user
}

async function discordLogin(ctx) {
  const { code } = ctx.request.body
  const oauth = new DiscordOauth2()
  const response = await oauth.tokenRequest({
    clientId: '671516199460274178',
    clientSecret: DISCORD_CLIENT_SECRET,
    code,
    scope: 'identify email',
    grantType: 'authorization_code',
    redirectUri: baseURL,
  })
  const discordUser = await oauth.getUser(response.access_token)
  const user = await User.findOneAndUpdate(
    { discordId: discordUser.id },
    {
      discordId: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      email: discordUser.email,
      avatarHash: discordUser.avatar,
    },
    { new: true, upsert: true }
  )

  ctx.body = {
    // We are acting like an access token provider for nuxt auth.
    access_token: jwt.sign(user.safeProps(), jwtSecret),
  }
}
