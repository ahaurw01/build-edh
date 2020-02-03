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
            deckCard: 'Lightning Greaves',
          },
          {
            deckCard: 'Sol Ring',
          },
          {
            deckCard: 'Lightning Bolt',
          },
          {
            deckCard: 'Goblin Grenade',
          },
          {
            deckCard: 'Mountain',
          },
          {
            deckCard: 'Mountain',
          },
          {
            deckCard: 'Mountain',
          },
        ])

        expect(store.getters.hand).toHaveLength(0)
        store.dispatch('draw', 3)
        expect(store.getters.hand).toHaveLength(3)
        expect(store.getters.hand).toEqual([
          {
            deckCard: 'Lightning Bolt',
          },
          {
            deckCard: 'Sol Ring',
          },
          {
            deckCard: 'Lightning Greaves',
          },
        ])
        expect(store.getters.library).toHaveLength(4)
        expect(store.getters.library).toEqual([
          {
            deckCard: 'Goblin Grenade',
          },
          {
            deckCard: 'Mountain',
          },
          {
            deckCard: 'Mountain',
          },
          {
            deckCard: 'Mountain',
          },
        ])
      })
    })
  })
})
