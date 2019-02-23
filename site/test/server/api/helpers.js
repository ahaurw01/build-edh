const supertest = require('supertest')
const bcrypt = require('bcrypt')
const { User } = require('../../../server/api/models')
const { app } = require('../../../server')
const server = app.callback()

module.exports = { mockLogin }

async function mockLogin() {
  jest
    .spyOn(User, 'findOne')
    .mockImplementation(() =>
      Promise.resolve(new User({ id: 1, username: 'aaron' }))
    )
  jest.spyOn(bcrypt, 'compare').mockImplementation(() => true)

  const {
    body: { token },
  } = await supertest(server)
    .post('/api/login')
    .send({ username: 'aaron', password: 'password' })

  return `Bearer ${token}`
}