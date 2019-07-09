import { getters } from '~/store/deck'

describe('Deck Store', () => {
  describe('getters', () => {
    describe('suggestedPurposes', () => {
      test('combines commander purposes with starting set of purposes', () => {
        const commanders = [
          {
            purposes: ['Ramp', 'Card draw'],
          },
          {
            purposes: ['Sac outlet', 'Board wipe'],
          },
        ]
        const state = {}

        const result = getters.suggestedPurposes(state, { commanders })

        expect(result).toEqual([
          'Ramp',
          'Card draw',
          'Sac outlet',
          'Board wipe',
          'Mana rock',
          'Targeted removal',
          'Utility',
        ])
      })
    })

    describe('colorIdentity', () => {
      test('combines ci of each commander in wubrg order', () => {
        const commanders = [
          {
            source: {
              ci: ['G'],
            },
          },
          {
            source: {
              ci: ['W', 'B'],
            },
          },
        ]
        const state = {}

        const result = getters.colorIdentity(state, { commanders })

        expect(result).toEqual(['W', 'B', 'G'])
      })

      test('is empty for colorless commander', () => {
        const commanders = [
          {
            source: {
              ci: [],
            },
          },
        ]
        const state = {}

        const result = getters.colorIdentity(state, { commanders })

        expect(result).toEqual([])
      })
    })

    describe('cardGroupingsByPurpose', () => {
      test('is empty array for no cards', () => {
        const the99 = []
        const state = {}

        const result = getters.cardGroupingsByPurpose(state, { the99 })

        expect(result).toEqual([])
      })

      test('groups all cards by purpose', () => {
        const the99 = [
          {
            source: { name: 'Lightning Bolt' },
            purposes: ['Burn', 'Targeted Removal'],
          },
          {
            source: { name: 'Mountain' },
            purposes: [],
          },
          {
            source: { name: 'Mountain' },
            purposes: [],
          },
          {
            source: { name: 'Mountain' },
            purposes: [],
          },
          {
            source: { name: 'Mountain' },
            purposes: [],
          },
          {
            source: { name: 'Mountain' },
            purposes: [],
          },
          {
            source: { name: 'Earthquake' },
            purposes: ['Burn', 'Board Wipe'],
          },
          {
            source: { name: 'Sol Ring' },
            purposes: [],
          },
        ]
        const state = {}

        const result = getters.cardGroupingsByPurpose(state, { the99 })

        expect(result).toEqual([
          {
            purpose: 'Other',
            cards: [
              { source: { name: 'Mountain' }, purposes: [], count: 5 },
              { source: { name: 'Sol Ring' }, purposes: [], count: 1 },
            ],
          },
          {
            purpose: 'Burn',
            cards: [
              {
                source: { name: 'Earthquake' },
                purposes: ['Burn', 'Board Wipe'],
                count: 1,
              },
              {
                source: { name: 'Lightning Bolt' },
                purposes: ['Burn', 'Targeted Removal'],
                count: 1,
              },
            ],
          },
          {
            purpose: 'Board Wipe',
            cards: [
              {
                source: { name: 'Earthquake' },
                purposes: ['Burn', 'Board Wipe'],
                count: 1,
              },
            ],
          },
          {
            purpose: 'Targeted Removal',
            cards: [
              {
                source: { name: 'Lightning Bolt' },
                purposes: ['Burn', 'Targeted Removal'],
                count: 1,
              },
            ],
          },
        ])
      })
    })
  })
})
