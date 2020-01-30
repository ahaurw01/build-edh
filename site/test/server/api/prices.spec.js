const supertest = require('supertest')
const { app } = require('../../../server')
const { Deck, Card, Price } = require('../../../server/api/models')
const server = app.callback()

jest.mock('../../../server/tcgplayer', () => ({
  getPricesForProductIds(ids) {
    if (ids === 1 || ids.join() === '1')
      return Promise.resolve({
        1: {
          tcgplayerId: 1,
          usd: '1.99',
          usdFoil: '10.99',
        },
      })
  },
}))

describe('price endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('get price for card', () => {
    test('works for uncached price', async () => {
      jest.spyOn(Price, 'findOne').mockImplementation(() => {
        return Promise.resolve(null)
      })
      jest.spyOn(Price, 'create').mockImplementation(arg => {
        return Promise.resolve(arg)
      })

      jest.spyOn(Card, 'findOne').mockImplementation(() => {
        return new Card({ tcgplayerId: 1 })
      })

      await supertest(server)
        .get('/api/prices/card/1')
        .expect(200)
        .expect({
          price: {
            tcgplayerId: 1,
            usd: '1.99',
            usdFoil: '10.99',
          },
        })

      expect(Price.findOne).toHaveBeenCalledWith({ tcgplayerId: 1 })
      expect(Card.findOne).toHaveBeenCalledWith({ tcgplayerId: 1 })
      expect(Price.create).toHaveBeenCalledWith({
        tcgplayerId: 1,
        usd: '1.99',
        usdFoil: '10.99',
      })
    })

    test('works for cached price', async () => {
      jest.spyOn(Price, 'findOne').mockImplementation(() => {
        return Promise.resolve({
          tcgplayerId: 2,
          usd: '2.99',
          usdFoil: '20.99',
        })
      })

      await supertest(server)
        .get('/api/prices/card/2')
        .expect(200)
        .expect({
          price: {
            tcgplayerId: 2,
            usd: '2.99',
            usdFoil: '20.99',
          },
        })

      expect(Price.findOne).toHaveBeenCalledWith({ tcgplayerId: 2 })
    })
  })

  describe('get price for whole deck', () => {
    test('it works for some cached, some not', async () => {
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
            new Card({ scryfallId: '1', tcgplayerId: 1 }),
            new Card({ scryfallId: '2', tcgplayerId: 2 }),
          ])
        )

      jest.spyOn(Price, 'find').mockImplementation(() => {
        return Promise.resolve([
          {
            tcgplayerId: 2,
            usd: '2.99',
            usdFoil: '20.99',
          },
        ])
      })

      jest.spyOn(Price, 'create').mockImplementation(arg => {
        return Promise.resolve(arg)
      })

      await supertest(server)
        .get('/api/prices/deck/123')
        .expect(200)
        .expect({
          prices: {
            1: {
              tcgplayerId: 1,
              usd: '1.99',
              usdFoil: '10.99',
            },
            2: {
              tcgplayerId: 2,
              usd: '2.99',
              usdFoil: '20.99',
            },
          },
        })
    })
  })
})
