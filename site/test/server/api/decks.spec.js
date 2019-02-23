const supertest = require('supertest')
const { app } = require('../../../server')

const server = app.callback()

describe('deck endpoints', () => {
  describe('get deck', () => {
    test('it works', async () => {
      await supertest(server)
        .get('/decks/abc123')
        .expect(200)
    })
  })
})
