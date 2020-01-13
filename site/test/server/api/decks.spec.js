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
        compuPurposes: [],
      })
    })
  })

  describe('add deck card', () => {
    test('add valid card', async () => {
      jest.spyOn(Deck.prototype, 'save').mockImplementation(function() {
        return Promise.resolve(this)
      })

      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            commanders: [{ scryfallId: '1' }],
          })
        )
      )

      jest
        .spyOn(Card, 'find')
        .mockImplementation(() =>
          Promise.resolve([
            new Card({ scryfallId: '1', name: 'Krenko' }),
            new Card({ scryfallId: '2', name: 'Mountain' }),
          ])
        )

      const response = await supertest(server)
        .post('/api/decks/abc123/the99')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2' } })
        .expect(200)

      expect(response.body).toEqual({
        uuid: expect.any(String),
        scryfallId: '2',
        purposes: [],
        isFoil: false,
        source: expect.any(Object),
      })
    })

    test('add card with invalid scryfallId', async () => {
      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            commanders: [{ scryfallId: '1' }],
          })
        )
      )

      jest
        .spyOn(Card, 'find')
        .mockImplementation(() =>
          Promise.resolve([new Card({ scryfallId: '1', name: 'Krenko' })])
        )

      await supertest(server)
        .post('/api/decks/abc123/the99')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2' } })
        .expect(400)
        .expect('Card not found')
    })

    test('add commander as 99', async () => {
      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            commanders: [{ scryfallId: '1' }],
          })
        )
      )

      jest
        .spyOn(Card, 'find')
        .mockImplementation(() =>
          Promise.resolve([
            new Card({ scryfallId: '1', name: 'Rafiq' }),
            new Card({ scryfallId: '2', name: 'Rafiq' }),
          ])
        )

      await supertest(server)
        .post('/api/decks/abc123/the99')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2' } })
        .expect(400)
        .expect('Cannot add commander to the 99')
    })

    test('add a duplicate card that cannot have multiple', async () => {
      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            commanders: [{ scryfallId: '1' }],
            the99: [{ scryfallId: '2' }],
          })
        )
      )

      jest.spyOn(Card, 'find').mockImplementation(() =>
        Promise.resolve([
          new Card({
            scryfallId: '1',
            name: 'Rafiq',
            canHaveMultiple: false,
          }),
          new Card({
            scryfallId: '2',
            name: 'Swords',
            canHaveMultiple: false,
          }),
        ])
      )

      await supertest(server)
        .post('/api/decks/abc123/the99')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2' } })
        .expect(400)
        .expect('Cannot add multiples of this card')
    })

    test('add a duplicate card with different scryfallId that cannot have multiple', async () => {
      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            commanders: [{ scryfallId: '1' }],
            the99: [{ scryfallId: '2' }],
          })
        )
      )

      jest.spyOn(Card, 'find').mockImplementation(() =>
        Promise.resolve([
          new Card({
            scryfallId: '1',
            name: 'Rafiq',
            canHaveMultiple: false,
          }),
          new Card({
            scryfallId: '2',
            name: 'Swords',
            canHaveMultiple: false,
          }),
          new Card({
            scryfallId: '3',
            name: 'Swords',
            canHaveMultiple: false,
          }),
        ])
      )

      await supertest(server)
        .post('/api/decks/abc123/the99')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '3' } })
        .expect(400)
        .expect('Cannot add multiples of this card')
    })

    test('add an allowed duplicate', async () => {
      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            commanders: [{ scryfallId: '1' }],
            the99: [{ scryfallId: '2' }],
          })
        )
      )

      jest.spyOn(Card, 'find').mockImplementation(() =>
        Promise.resolve([
          new Card({
            scryfallId: '1',
            name: 'Rafiq',
            canHaveMultiple: false,
          }),
          new Card({
            scryfallId: '2',
            name: 'Forest',
            canHaveMultiple: true,
          }),
        ])
      )

      await supertest(server)
        .post('/api/decks/abc123/the99')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2' } })
        .expect(200)
    })
  })

  describe('delete deck card', () => {
    beforeEach(() => {
      jest.spyOn(Deck.prototype, 'save').mockImplementation(function() {
        return Promise.resolve(this)
      })
    })

    test('delete valid card', async () => {
      const deck = new Deck({
        commanders: [{ scryfallId: '1' }],
        the99: [
          { scryfallId: '2', uuid: 'abc123' },
          { scryfallId: '3', uuid: 'xyz456' },
        ],
      })

      jest
        .spyOn(Deck, 'findOne')
        .mockImplementation(() => Promise.resolve(deck))

      jest
        .spyOn(Card, 'find')
        .mockImplementation(() =>
          Promise.resolve([
            new Card({ scryfallId: '1', name: 'Krenko' }),
            new Card({ scryfallId: '3', name: 'Lightning Bolt' }),
          ])
        )

      await supertest(server)
        .delete('/api/decks/abc123/the99/abc123')
        .set('Authorization', tokenHeader)
        .expect(204)

      expect(deck.the99).toHaveLength(1)
      expect(deck.the99[0].uuid).toBe('xyz456')
    })

    test('delete unknown card', async () => {
      const deck = new Deck({
        commanders: [{ scryfallId: '1' }],
        the99: [{ scryfallId: '2', uuid: 'abc123' }],
      })

      jest
        .spyOn(Deck, 'findOne')
        .mockImplementation(() => Promise.resolve(deck))

      jest
        .spyOn(Card, 'find')
        .mockImplementation(() =>
          Promise.resolve([
            new Card({ scryfallId: '1', name: 'Krenko' }),
            new Card({ scryfallId: '2', name: 'Mountain' }),
          ])
        )

      await supertest(server)
        .delete('/api/decks/abc123/the99/xyz456')
        .set('Authorization', tokenHeader)
        .expect(400)
        .expect('UUID not found')

      expect(deck.the99).toHaveLength(1)
    })
  })

  describe('bulk update deck', () => {
    test('unsuccessful update - validation errors', async () => {
      const updates = ['Lightning Bolt # pew pew', 'Lightning Bolt # pew pew']
      const deck = new Deck({
        commanders: [{ scryfallId: '1' }],
        the99: [{ scryfallId: '3', uuid: 'xyz456' }],
      })
      deck.save = jest.fn(function() {
        return Promise.resolve(this)
      })

      jest
        .spyOn(Deck, 'findOne')
        .mockImplementation(() => Promise.resolve(deck))

      jest.spyOn(Card, 'findWithNames').mockImplementation(() =>
        Promise.resolve([
          new Card({
            name: 'Lightning Bolt',
            scryfallId: '4',
            canHaveMultiple: false,
          }),
        ])
      )

      let cardFindCall = 0
      jest.spyOn(Card, 'find').mockImplementation(() => {
        cardFindCall++
        if (cardFindCall === 1) {
          // Populate commander sources
          return Promise.resolve([
            new Card({
              scryfallId: '1',
              name: 'Krenko',
              canBeCommander: true,
              canHaveMultiple: false,
            }),
          ])
        }
        if (cardFindCall === 2) {
          // Populate the99 sources
          return Promise.resolve([
            new Card({
              scryfallId: '3',
              name: 'Goblin Bombardment',
              canHaveMultiple: false,
            }),
            new Card({
              name: 'Lightning Bolt',
              scryfallId: '4',
              canHaveMultiple: false,
            }),
          ])
        }
        throw new Error('Card.find not expected to be called more than twice')
      })

      await supertest(server)
        .put('/api/decks/111/bulk')
        .send({ updates })
        .set('Authorization', tokenHeader)
        .expect(400)
        .expect({
          missingCardInputs: [],
          commanderErrorMessages: [],
          the99ErrorMessages: ['Illegal duplicates: Lightning Bolt'],
        })

      expect(deck.save).not.toHaveBeenCalled()
    })

    test('successful update', async () => {
      const updates = [
        'Krenko *CMDR* # bum rush',
        'Lightning Bolt # pew pew',
        '3 Mountain',
      ]
      const deck = new Deck({
        commanders: [],
        the99: [{ scryfallId: '3', uuid: 'xyz456' }],
      })
      deck.save = jest.fn(function() {
        return Promise.resolve(this)
      })

      jest
        .spyOn(Deck, 'findOne')
        .mockImplementation(() => Promise.resolve(deck))

      jest.spyOn(Card, 'findWithNames').mockImplementation(() =>
        Promise.resolve([
          new Card({
            scryfallId: '1',
            name: 'Krenko',
            canBeCommander: true,
            canHaveMultiple: false,
          }),
          new Card({
            name: 'Lightning Bolt',
            scryfallId: '4',
            canHaveMultiple: false,
          }),
          new Card({
            name: 'Mountain',
            scryfallId: '5',
            canHaveMultiple: true,
          }),
        ])
      )

      let cardFindCall = 0
      jest.spyOn(Card, 'find').mockImplementation(() => {
        cardFindCall++
        if (cardFindCall === 1) {
          // Populate commander sources
          return Promise.resolve([
            new Card({
              scryfallId: '1',
              name: 'Krenko',
              canBeCommander: true,
              canHaveMultiple: false,
            }),
          ])
        }
        if (cardFindCall === 2) {
          // Populate the99 sources
          return Promise.resolve([
            new Card({
              scryfallId: '3',
              name: 'Goblin Bombardment',
              canHaveMultiple: false,
            }),
            new Card({
              name: 'Lightning Bolt',
              scryfallId: '4',
              canHaveMultiple: false,
            }),
            new Card({
              name: 'Mountain',
              scryfallId: '5',
              canHaveMultiple: true,
            }),
          ])
        }
        if (cardFindCall === 3) {
          // Final deck source population
          return Promise.resolve([
            new Card({
              scryfallId: '1',
              name: 'Krenko',
              canBeCommander: true,
              canHaveMultiple: false,
            }),
            new Card({
              scryfallId: '3',
              name: 'Goblin Bombardment',
              canHaveMultiple: false,
            }),
            new Card({
              name: 'Lightning Bolt',
              scryfallId: '4',
              canHaveMultiple: false,
            }),
            new Card({
              name: 'Mountain',
              scryfallId: '5',
              canHaveMultiple: true,
            }),
          ])
        }
        throw new Error('Card.find not expected to be called more than thrice')
      })

      await supertest(server)
        .put('/api/decks/111/bulk')
        .send({ updates })
        .set('Authorization', tokenHeader)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty('commanders')
          expect(body).toHaveProperty('the99')
        })

      expect(deck.save).toHaveBeenCalledTimes(1)
      expect(deck.commanders).toHaveLength(1)
      expect(deck.commanders[0].scryfallId).toEqual('1')
      expect(deck.commanders[0].purposes[0]).toEqual('bum rush')
      expect(deck.the99).toHaveLength(5)
      expect(deck.the99[0].scryfallId).toEqual('3')
      expect(deck.the99[1].scryfallId).toEqual('4')
      expect(deck.the99[1].purposes[0]).toEqual('pew pew')
      expect(deck.the99[2].scryfallId).toEqual('5')
      expect(deck.the99[3].scryfallId).toEqual('5')
      expect(deck.the99[4].scryfallId).toEqual('5')
    })
  })
})
