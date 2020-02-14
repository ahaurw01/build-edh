const jwt = require('jsonwebtoken')
const DiscordOauth2 = require('discord-oauth2')
const { User } = require('./models')
const { baseURL, DISCORD_CLIENT_SECRET } = require('../../nuxt.config.js')

const jwtSecret = process.env.JWT_SECRET

module.exports = {
  me,
  discordLogin,
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
    access_token: jwt.sign(user.safeProps(), jwtSecret, {
      expiresIn: '30 days',
    }),
  }
}
