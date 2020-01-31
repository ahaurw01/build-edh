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
      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
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

  describe('update deck properties', () => {
    test('update name', async () => {
      jest
        .spyOn(Deck, 'findOne')
        .mockImplementation(() => Promise.resolve(new Deck()))

      jest.spyOn(Deck.prototype, 'save').mockImplementation(function() {
        return this
      })

      const { body } = await supertest(server)
        .put('/api/decks/abc123')
        .send({ name: 'new name' })
        .set('Authorization', tokenHeader)
        .expect(200)

      expect(body).toEqual(
        expect.objectContaining({
          name: 'new name',
          slug: expect.stringContaining('new-name-'),
        })
      )
    })

    test('name no-op', async () => {
      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            name: 'name',
            slug: 'slug',
          })
        )
      )

      jest.spyOn(Deck.prototype, 'save').mockImplementation(function() {
        return this
      })

      const { body } = await supertest(server)
        .put('/api/decks/abc123')
        .send({ name: 'name' })
        .set('Authorization', tokenHeader)
        .expect(200)

      expect(body).toEqual(
        expect.objectContaining({
          name: 'name',
          slug: 'slug',
        })
      )
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

      jest.spyOn(Card, 'find').mockImplementation(query => {
        return Promise.resolve(
          query.scryfallId.$in.map(
            scryfallId =>
              new Card({
                scryfallId,
                name: scryfallId,
              })
          )
        )
      })

      const response = await supertest(server)
        .post('/api/decks/abc123/the99')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2' } })
        .expect(200)

      expect(response.body).toEqual({
        the99: [
          expect.objectContaining({
            uuid: expect.any(String),
            scryfallId: '2',
            purposes: [],
            isFoil: false,
            source: expect.any(Object),
          }),
        ],
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

      jest.spyOn(Card, 'find').mockImplementation(query => {
        if (query.scryfallId.$in[0] === '1')
          return Promise.resolve([
            new Card({ scryfallId: '1', name: 'Krenko' }),
          ])

        return Promise.resolve([])
      })

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

      jest.spyOn(Card, 'find').mockImplementation(query => {
        return Promise.resolve(
          query.scryfallId.$in.map(
            scryfallId =>
              new Card({
                scryfallId,
                name: scryfallId,
                canHaveMultiple: false,
              })
          )
        )
      })

      await supertest(server)
        .post('/api/decks/abc123/the99')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2' } })
        .expect(400)
        .expect('Illegal duplicates: 2')
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

      jest.spyOn(Card, 'find').mockImplementation(query => {
        return Promise.resolve(
          query.scryfallId.$in.map(
            scryfallId =>
              new Card({
                scryfallId,
                name: scryfallId,
                canHaveMultiple: true,
              })
          )
        )
      })

      const response = await supertest(server)
        .post('/api/decks/abc123/the99')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2' }, count: 17 })
        .expect(200)

      expect(response.body.the99).toHaveLength(18)
    })
  })

  describe('update deck card', () => {
    test('update one card', async () => {
      jest.spyOn(Deck.prototype, 'save').mockImplementation(function() {
        return Promise.resolve(this)
      })

      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            the99: [{ scryfallId: '1', uuid: 'u1', isFoil: false }],
          })
        )
      )

      jest.spyOn(Card, 'find').mockImplementation(query => {
        return Promise.resolve(
          query.scryfallId.$in.map(
            scryfallId =>
              new Card({
                scryfallId,
                name: scryfallId,
                canHaveMultiple: false,
                isFoil: false,
              })
          )
        )
      })

      const response = await supertest(server)
        .put('/api/decks/abc123/the99/u1')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2', purposes: ['do a thing'] } })
        .expect(200)

      expect(response.body).toEqual({
        the99: [
          expect.objectContaining({
            uuid: expect.any(String),
            scryfallId: '2',
            purposes: ['do a thing'],
            source: expect.any(Object),
            isFoil: false,
          }),
        ],
      })
    })

    test('update to bogus card', async () => {
      jest.spyOn(Deck.prototype, 'save').mockImplementation(function() {
        return Promise.resolve(this)
      })

      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            the99: [{ scryfallId: '1', uuid: 'u1', isFoil: false }],
          })
        )
      )

      jest.spyOn(Card, 'find').mockImplementation(query => {
        return Promise.resolve(
          query.scryfallId.$in
            .map(scryfallId =>
              scryfallId === '1'
                ? new Card({
                    scryfallId,
                    name: scryfallId,
                    canHaveMultiple: false,
                    isFoil: false,
                  })
                : null
            )
            .filter(x => x)
        )
      })

      await supertest(server)
        .put('/api/decks/abc123/the99/u1')
        .set('Authorization', tokenHeader)
        .send({ card: { scryfallId: '2', purposes: ['do a thing'] } })
        .expect(400)
        .expect('Card not found')
    })

    test('update number of cards', async () => {
      jest.spyOn(Deck.prototype, 'save').mockImplementation(function() {
        return Promise.resolve(this)
      })

      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            the99: [{ scryfallId: '1', uuid: 'u1', isFoil: false }],
          })
        )
      )

      jest.spyOn(Card, 'find').mockImplementation(query => {
        return Promise.resolve(
          query.scryfallId.$in.map(
            scryfallId =>
              new Card({
                scryfallId,
                name: scryfallId,
                canHaveMultiple: true,
                isFoil: false,
              })
          )
        )
      })

      const response = await supertest(server)
        .put('/api/decks/abc123/the99/u1')
        .set('Authorization', tokenHeader)
        .send({
          card: { scryfallId: '1', purposes: ['do a thing'] },
          count: 17,
        })
        .expect(200)

      expect(response.body).toEqual({
        the99: '.'
          .repeat(17)
          .split('')
          .map(() =>
            expect.objectContaining({
              uuid: expect.any(String),
              scryfallId: '1',
              purposes: ['do a thing'],
              source: expect.any(Object),
              isFoil: false,
            })
          ),
      })
    })

    test('update to illegal number of cards', async () => {
      jest.spyOn(Deck.prototype, 'save').mockImplementation(function() {
        return Promise.resolve(this)
      })

      jest.spyOn(Deck, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new Deck({
            the99: [{ scryfallId: '1', uuid: 'u1', isFoil: false }],
          })
        )
      )

      jest.spyOn(Card, 'find').mockImplementation(query => {
        return Promise.resolve(
          query.scryfallId.$in.map(
            scryfallId =>
              new Card({
                scryfallId,
                name: scryfallId,
                canHaveMultiple: false,
                isFoil: false,
              })
          )
        )
      })

      await supertest(server)
        .put('/api/decks/abc123/the99/u1')
        .set('Authorization', tokenHeader)
        .send({
          card: { scryfallId: '1', purposes: ['do a thing'] },
          count: 17,
        })
        .expect(400)
        .expect('Illegal duplicates: 1')
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
        .expect(200)

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
      expect(deck.the99).toHaveLength(4)
      expect(deck.the99[0].scryfallId).toEqual('4')
      expect(deck.the99[0].purposes[0]).toEqual('pew pew')
      expect(deck.the99[1].scryfallId).toEqual('5')
      expect(deck.the99[2].scryfallId).toEqual('5')
      expect(deck.the99[3].scryfallId).toEqual('5')
    })
  })
})
