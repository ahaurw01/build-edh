import Vue from 'vue'
import Vuex from 'vuex'
import { state, getters, actions, mutations } from '~/store/playtest'

jest.mock(
  'lodash/shuffle',
  () =>
    function(array) {
      return array.reverse()
    }
)

Vue.use(Vuex)
const makeStore = () => new Vuex.Store({ state, getters, actions, mutations })

describe('Playtest Store', () => {
  describe('actions', () => {
    describe('build', () => {
      test('constructs shuffled library and command zone', () => {
        const store = makeStore()

        store.commit('deck', {
          commanders: ['Krenko'],
          the99: [
            'Mountain',
            'Mountain',
            'Mountain',
            'Goblin Grenade',
            'Lightning Bolt',
            'Sol Ring',
            'Lightning Greaves',
          ],
        })

        store.dispatch('build')

        const { library, commandZone } = store.getters
        expect(library).toHaveLength(7)
        expect(commandZone).toHaveLength(1)

        expect(library).toEqual([
          { deckCard: 'Lightning Greaves' },
          { deckCard: 'Sol Ring' },
          { deckCard: 'Lightning Bolt' },
          { deckCard: 'Goblin Grenade' },
          { deckCard: 'Mountain' },
          { deckCard: 'Mountain' },
          { deckCard: 'Mountain' },
        ])

        expect(commandZone[0]).toHaveProperty('deckCard', 'Krenko')
      })
    })

    describe('draw', () => {
      test('draws cards from library to hand', () => {
        const store = makeStore()

        store.commit('library', [
          {
            deckCard: { uuid: 1, source: 'Lightning Greaves' },
          },
          {
            deckCard: { uuid: 2, source: 'Sol Ring' },
          },
          {
            deckCard: { uuid: 3, source: 'Lightning Bolt' },
          },
          {
            deckCard: { uuid: 4, source: 'Goblin Grenade' },
          },
          {
            deckCard: { uuid: 5, source: 'Mountain' },
          },
          {
            deckCard: { uuid: 6, source: 'Mountain' },
          },
          {
            deckCard: { uuid: 7, source: 'Mountain' },
          },
        ])

        expect(store.getters.hand).toHaveLength(0)
        store.dispatch('draw', 3)
        expect(store.getters.hand).toHaveLength(3)
        expect(store.getters.hand).toEqual([
          {
            deckCard: { uuid: 3, source: 'Lightning Bolt' },
          },
          {
            deckCard: { uuid: 2, source: 'Sol Ring' },
          },
          {
            deckCard: { uuid: 1, source: 'Lightning Greaves' },
          },
        ])
        expect(store.getters.library).toHaveLength(4)
        expect(store.getters.library).toEqual([
          {
            deckCard: { uuid: 4, source: 'Goblin Grenade' },
          },
          {
            deckCard: { uuid: 5, source: 'Mountain' },
          },
          {
            deckCard: { uuid: 6, source: 'Mountain' },
          },
          {
            deckCard: { uuid: 7, source: 'Mountain' },
          },
        ])
      })
    })

    describe('move', () => {
      describe('send to bottom', () => {
        test('adjusts library as appropriate', () => {
          const store = makeStore()

          store.commit('library', [
            {
              deckCard: { source: { name: 'Lightning Greaves' }, uuid: 1 },
            },
            {
              deckCard: { source: { name: 'Sol Ring' }, uuid: 2 },
            },
            {
              deckCard: { source: { name: 'Lightning Bolt' }, uuid: 3 },
            },
          ])

          store.dispatch('move', {
            uuid: 1,
            position: -1,
            fromZone: 'library',
            toZone: 'library',
          })

          expect(store.getters.library).toHaveLength(3)
          expect(store.getters.library).toEqual([
            {
              deckCard: { source: { name: 'Sol Ring' }, uuid: 2 },
            },
            {
              deckCard: { source: { name: 'Lightning Bolt' }, uuid: 3 },
            },
            {
              deckCard: { source: { name: 'Lightning Greaves' }, uuid: 1 },
            },
          ])
        })
      })
    })
  })
})
