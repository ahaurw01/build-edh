const supertest = require('supertest')
const DiscordOauth2 = require('discord-oauth2')
const { User } = require('../../../server/api/models')
const { app } = require('../../../server')
const server = app.callback()

module.exports = { mockLogin }

async function mockLogin() {
  jest
    .spyOn(User, 'findOneAndUpdate')
    .mockImplementation(() =>
      Promise.resolve(new User({ id: 1, username: 'aaron' }))
    )

  DiscordOauth2.prototype.tokenRequest = DiscordOauth2.prototype.getUser = function() {
    return Promise.resolve({})
  }

  const {
    body: { access_token },
  } = await supertest(server)
    .post('/api/login/discord')
    .send({ code: 'mock code' })

  return `Bearer ${access_token}`
}
