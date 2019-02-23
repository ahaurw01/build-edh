const supertest = require('supertest')
const { app } = require('../../../server')
const { Deck, Card } = require('../../../server/api/models')
const { mockLogin } = require('./helpers')
const server = app.callback()

let tokenHeader

describe('deck endpoints', () => {
  beforeEach(async () => {
    tokenHeader = await mockLogin()
  })

  describe('get deck', () => {
    test('it works', async () => {
      jest.spyOn(Deck, 'findById').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            commanders: [{ scryfallId: '1' }],
            the99: [{ scryfallId: '2' }],
          })
        )
      )

      jest
        .spyOn(Card, 'find')
        .mockImplementation(() =>
          Promise.resolve([
            new Card({ scryfallId: '1' }),
            new Card({ scryfallId: '2' }),
          ])
        )

      const response = await supertest(server)
        .get('/api/decks/abc123')
        .set('Authorization', tokenHeader)
        .expect(200)

      expect(response.body).toEqual({
        _id: expect.any(String),
        commanders: [
          {
            _id: expect.any(String),
            purposes: [],
            scryfallId: '1',
            source: expect.any(Object),
          },
        ],
        the99: [
          {
            _id: expect.any(String),
            purposes: [],
            scryfallId: '2',
            source: expect.any(Object),
          },
        ],
      })
    })
  })
})
